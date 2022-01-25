declare namespace Mask {
    export const socialNetwork: SocialNetwork
    /**
     * A set of API available when the web page is opened by the Mask Network as an External Plugin.
     *
     * All APIs in this object only available when the `.connected` is true
     *
     * @remarks Since API=0
     * @public
     */
    export interface SocialNetwork extends EventTarget {
        /**
         * If the social network is still connected.
         *
         * @remarks Since API=0
         * @public
         */
        get connected(): boolean
        /**
         * Append a text message to composition dialog.
         *
         * @public
         * @remarks
         * Since API=0
         * If this message does not contains metadata, Mask Network may display a UI to ask user if they want this message encrypted or not.
         *
         * @param message - A text message to be send.
         * @param metadata - Extra machine-readable message to be send.
         * If value in the Map is *not* Uint8Array or ArrayBuffer, it will be encoded with MessagePack.
         *
         * @example
         * ```ts
         * Mask
         *  .socialNetwork
         *  .appendComposition("This message will appear in the Composition dialog of Mask Network.", new Map("meta", {}))
         * ```
         */
        appendComposition(message: string, metadata?: ReadonlyMap<string, unknown>): Promise<void>
        /**
         * The metadata that used to open the current web page.
         * @public
         * @remarks Since API=0
         */
        readonly metadata?: Map<string, unknown>
        // #region Typed event listener
        addEventListener<K extends keyof SocialNetworkEventMap>(
            type: K,
            listener: (this: Document, ev: SocialNetworkEventMap[K]) => any,
            options?: boolean | AddEventListenerOptions,
        ): void
        addEventListener(
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions,
        ): void
        removeEventListener<K extends keyof SocialNetworkEventMap>(
            type: K,
            listener: (this: Document, ev: SocialNetworkEventMap[K]) => any,
            options?: boolean | EventListenerOptions,
        ): void
        removeEventListener(
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | EventListenerOptions,
        ): void
        // #endregion
    }
    /**
     * Events supported by SocialNetwork object.
     * @public
     */
    export interface SocialNetworkEventMap {
        /** This instance has connected to a SocialNetwork. */
        connected: Event
        /** This instance has disconnected to a SocialNetwork. */
        disconnected: Event
    }
}
