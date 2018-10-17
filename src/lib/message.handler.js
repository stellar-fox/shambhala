/**
 * Shambhala.
 *
 * Simple message-handling library.
 *
 * @module message-handler
 * @license Apache-2.0
 */




import {
    choose,
    handleException,
} from "@xcmats/js-toolbox"
import * as message from "./messages"




/**
 * ...
 */
export default class MessageHandler {

    constructor (store) {
        this.store = store
        this.handlers = {}
        window.addEventListener(
            "message",
            this.eventProcessor
        )
    }


    /**
     * ...
     */
    handle = (m, handler, persistent = false) => {
        this.handlers[m] =
            persistent ?
                handler :
                (p) => {
                    delete this.handlers[m]
                    handler(p)
                }
    }


    /**
     * ...
     */
    eventProcessor = (e) => {

        // don't get fooled by potential messages from others
        if (e.origin !== this.store.url.origin) { return }

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

}
