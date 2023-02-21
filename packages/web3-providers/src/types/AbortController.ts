export namespace AbortControllerAPI {
    export interface Provider {
        /** Create a new kind of AbortController. */
        create(...args: any[]): AbortController
    }
}
