/**
 * Shambhala.
 *
 * Simple message handling.
 *
 * @module message-handler
 * @license Apache-2.0
 */




import {
    async,
    choose,
    handleException,
} from "@xcmats/js-toolbox"
import { consoleWrapper } from "./utils"
import * as message from "./messages"
import { defaultMessageTimeout } from "../config/env"




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
     * @memberof module:message-handler~MessageHandler
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
     * @memberof module:message-handler~MessageHandler
     * @param {String} message
     * @param {Object} [payload]
     */
    postMessage = (message, payload = {}) => {
        this.recipient.postMessage(
            JSON.stringify({ message, payload }),
            this.origin
        )
    }




    /**
     * Register message handler for a specified message.
     *
     * @instance
     * @method handle
     * @memberof module:message-handler~MessageHandler
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
     * @memberof module:message-handler~MessageHandler
     * @param {String} message
     */
    unhandle = (message) => { delete this.handlers[message] }




    /**
     * Receive one specified message with payload.
     * Guarded by watchdog timer - rejects if timeout reached.
     *
     * @async
     * @instance
     * @method receiveMessage
     * @memberof module:message-handler~MessageHandler
     * @param {String} message
     * @param {Number} [timeout]
     * @returns {Promise.<Object>}
     */
    receiveMessage = (message, timeout = defaultMessageTimeout) =>
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

                    // wait for message and when it'll arrive
                    // cancel the timeout and resolve promise
                    this.handle(message, (payload) => {
                        cancelTimeout()
                        resolve(payload)
                    }, true)

                }

            // catch the exception - `async.timeout` throws when
            // cancelled, but here it's the "positive scenario";
            // if timeout has been cancelled then message was
            // received and handled
            ).catch()

        })




    /**
     * Event parser and dispatcher. Not to be called directly.
     * Registered as "message" event listener to `window` object
     * in constructor.
     *
     * @instance
     * @private
     * @method _messageProcessor
     * @memberof module:message-handler~MessageHandler
     * @param {Object} e
     */
    _messageProcessor = (e) => {

        // don't get fooled by potential messages from others
        if (e.origin !== this.origin) { return }

        // parse the packet of data
        let packet = handleException(
            () => JSON.parse(e.data),
            (ex) => ({
                message: message.ERROR,
                payload: e,
                exception: ex,
            })
        )

        // undertake action
        choose(
            packet.message,
            this.handlers,
            () => logger.info("Received:", packet, "from", e.origin),
            [packet.payload]
        )

    }




    /**
     * Deregister message parsing and dispatching from `window` object.
     *
     * @instance
     * @method remove
     * @memberof module:message-handler~MessageHandler
     */
    remove = () =>
        window.removeEventListener(
            "message", this._messageProcessor
        )

}
