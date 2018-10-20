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
import * as message from "./messages"
import { defaultMessageTimeout } from "../config/env"




/**
 * ...
 */
export default class MessageHandler {

    constructor (origin) {
        this.origin = origin
        this.handlers = {}
        window.addEventListener(
            "message",
            this.eventProcessor
        )
    }




    /**
     * ...
     */
    setRecipient = (recipient, windowName) => {
        this.recipient = recipient
        this.windowName = windowName
    }




    /**
     * ...
     */
    postMessage = (message, payload = {}) => {
        this.recipient.postMessage(
            JSON.stringify({ message, payload }),
            this.origin
        )
    }




    /**
     * ...
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
     * ...
     */
    unhandle = (message) => { delete this.handlers[message] }




    /**
     * ...
     */
    receiveMessage = (message, timeout = defaultMessageTimeout) =>
        new Promise((resolve, reject) => {

            // "watchdog" timer
            async.timeout(

                // unregister message handler and reject promise when...
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
            // timeout has been cancelled means that message was
            // received and handled
            ).catch()

        })




    /**
     * ...
     */
    eventProcessor = (e) => {

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
            // eslint-disable-next-line no-console
            (p) => console.info("Received:", p, "from", e.origin),
            [packet.payload]
        )

    }




    /**
     * ...
     */
    remove = () =>
        window.removeEventListener(
            "message",
            this.eventProcessor
        )

}
