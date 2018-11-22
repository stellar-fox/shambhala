/**
 * Shambhala.
 *
 * Simple message handling.
 *
 * @module message-handler-lib
 * @license Apache-2.0
 */




import {
    async,
    func,
    string,
    utils,
} from "@xcmats/js-toolbox"
import { consoleWrapper } from "./utils"
import {
    ERROR,
    HEARTBEAT,
} from "./messages"
import {
    defaultHeartbeatInterval,
    defaultLongReceivingTimeout,
    defaultMessageTimeout,
} from "../config/env"




/**
 * @private
 * @function logger
 */
const logger = consoleWrapper("📬")




/**
 * In-browser cross-origin message passing.
 *
 * @class MessageHandler
 * @param {String} origin origin URI of the target window
 */
export default class MessageHandler {

    constructor (origin) {
        this.origin = origin
        this.handlers = {}
        window.addEventListener(
            "message", this._messageProcessor
        )
    }




    /**
     * Set details of target window (recipient).
     *
     * @instance
     * @method setRecipient
     * @memberof module:message-handler-lib~MessageHandler
     * @param {Object} recipient
     * @param {String} windowName
     */
    setRecipient = (recipient, windowName) => {
        this.recipient = recipient
        this.windowName = windowName
    }




    /**
     * Send message with an optional payload to the recipient.
     *
     * @instance
     * @method postMessage
     * @memberof module:message-handler-lib~MessageHandler
     * @param {String} message
     * @param {Object} [payload]
     */
    postMessage = (message, payload = {}) =>
        this.recipient.postMessage(
            JSON.stringify({ message, payload }),
            this.origin
        )




    /**
     * Register message handler for a specified message.
     *
     * @instance
     * @method handle
     * @memberof module:message-handler-lib~MessageHandler
     * @param {String} message
     * @param {Function} handler
     * @param {Boolean} [volatile] If set to true then
     *     handler will be automatically deregistered
     *     after one message.
     */
    handle = (message, handler, volatile = false) => {
        this.handlers[message] =
            volatile ?
                (payload) => {
                    delete this.handlers[message]
                    handler(payload)
                } :
                handler
    }




    /**
     * Unregister message handler for a specified message.
     *
     * @instance
     * @method unhandle
     * @memberof module:message-handler-lib~MessageHandler
     * @param {String} message
     */
    unhandle = (message) => { delete this.handlers[message] }




    /**
     * Receive one specified message with payload.
     * Guarded by watchdog timer - rejects if timeout reached.
     *
     * Also - externally cancellable. Pass a function as a last
     * argument and it'll receive the "canceller". When "canceller"
     * will be invoked, whole `receiveMessage` invocation will be cancelled.
     *
     * @async
     * @instance
     * @method receiveMessage
     * @memberof module:message-handler-lib~MessageHandler
     * @param {String} message
     * @param {Number} [timeout]
     * @param {Function} [cancel] (canceller) => any
     * @returns {Promise.<Object>}
     */
    receiveMessage = (
        message,
        timeout = defaultMessageTimeout,
        cancel = func.identity
    ) =>
        new Promise((resolve, reject) => {

            // "watchdog" timer
            async.timeout(

                // remove message handler and reject promise when...
                () => {
                    this.unhandle(message)
                    reject("receiveMessage: timeout exceeded")
                },

                // ... `timeout` miliseconds has passed ...
                timeout,

                // ... but immediately execute following function,
                // passing "timeout canceller" - a function, that
                // when invoked, will cancel the timeout
                (cancelTimeout) => {

                    // first - pass whole "receiveMessage canceller",
                    // to the `cancel` function. It allows somebody from
                    // the outside world to cancel this invocation
                    // of `receiveMessage`. "Cancellable promises"??
                    cancel((reason) => {
                        this.unhandle(message)
                        cancelTimeout("receiveMessage cancelled externally.")
                        reject(reason)
                    })

                    // wait for message and when it'll arrive
                    // cancel the timeout ("watchdog timer")
                    // and resolve the promise
                    this.handle(message, (payload) => {
                        cancelTimeout("Message received.")
                        resolve(payload)
                    }, true)

                }

            // catch the exception - `async.timeout` rejects when
            // cancelled, but here it's the "positive scenario";
            // if timeout has been cancelled then message was
            // received and handled
            ).catch((_) => _)

        })




    /**
     * "Heartbeat" version of `receiveMessage`.
     * Used for long-lasting queries.
     *
     * @async
     * @instance
     * @method receiveMessageHB
     * @memberof module:message-handler-lib~MessageHandler
     * @param {String} message
     * @param {Object} [opts]
     * @returns {Promise.<Object>}
     */
    receiveMessageHB = async (
        message,
        {
            hb = HEARTBEAT,
            hbInterval = defaultHeartbeatInterval,
            hbCallback = func.identity,
            rmTimeout = defaultLongReceivingTimeout,
        } = {}
    ) => {

        let
            abortReceiving = null,
            stopHeartbeat = null,
            payload = null

        // first "main step" - setup heartbeat interval:
        // every `hbInterval` milliseconds ...
        async.interval(

            async () => {

                let hbPayload = null

                // ... send `hb` message ...
                this.postMessage(hb)

                // ... and wait for the response
                try {

                    hbPayload = await this.receiveMessage(hb, 0.8 * hbInterval)

                    // if response came then pass received `hbPayload`
                    // to the `hbCallback` function
                    utils.handleException(() => hbCallback(hbPayload))

                } catch (_) {

                    // if response didn't come on time, stop
                    // heartbeat interval and abort message receiving
                    stopHeartbeat()
                    abortReceiving("the heart stopped beating")

                }
            },

            (canceller) => { stopHeartbeat = canceller },
            hbInterval

        )

        // second "main" step - wait for the `message` to come;
        // it can be a long wait, but while the heart beats, we know
        // that something's going on
        try {

            payload = await this.receiveMessage(
                message,
                rmTimeout,
                (canceller) => { abortReceiving = canceller }
            )

        } finally {

            // we should stop the heartbeat in two cases:
            // - when `rmTimeout` kicks-in - in such case an exception
            //   is thrown,
            // - when everything went smooth - afer potentially long wait
            //   the message has been received,
            stopHeartbeat()

        }

        return payload

    }




    /**
     * Event parser and dispatcher. Not to be called directly.
     * Registered as "message" event listener to `window` object
     * in constructor.
     *
     * @instance
     * @private
     * @method _messageProcessor
     * @memberof module:message-handler-lib~MessageHandler
     * @param {Object} e
     */
    _messageProcessor = (e) => {

        // don't get fooled by potential messages from others
        if (e.origin !== this.origin) { return }

        // parse the packet of data
        let packet = utils.handleException(
            () => JSON.parse(e.data),
            (ex) => ({
                message: ERROR,
                payload: e,
                exception: ex,
            })
        )

        // undertake action
        func.choose(
            packet.message,
            this.handlers,
            () => logger.info(
                "Received:", packet, "from", string.quote(e.origin)
            ),
            [packet.payload]
        )

    }




    /**
     * Deregister message parsing and dispatching from `window` object.
     *
     * @instance
     * @method remove
     * @memberof module:message-handler-lib~MessageHandler
     */
    remove = () =>
        window.removeEventListener(
            "message", this._messageProcessor
        )

}
