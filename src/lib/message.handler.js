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
                (p) => {
                    delete this.handlers[message]
                    handler(p)
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
            let cancelTimeout = null

            // watchdog timer
            async.timeout(
                () => {
                    this.unhandle(message)
                    reject("receiveMessage: timeout exceeded")
                },
                timeout,
                (cancel) => { cancelTimeout = cancel }
            ).catch()

            // wait for message and resolve
            this.handle(message, (data) => {
                cancelTimeout()
                resolve(data)
            }, true)
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
            [packet]
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
