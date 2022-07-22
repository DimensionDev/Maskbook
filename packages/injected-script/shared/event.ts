import { $ } from './intrinsic.js'

export const CustomEventId = '5335deb80db6-c8a6c18e-f6a3-472a'
export interface InternalEvents {
    /** Simulate a paste event on the activeElement */
    paste: [text: string]
    /** Simulate an image paste event on the activeElement */
    pasteImage: [number[]]
    /** Simulate a input event on the activeElement */
    input: [text: string]
    /** Simulate a image upload on the activeElement on instagram */
    instagramUpload: [url: string]
    /**
     * Simulate an image upload event.
     *
     * How to use:
     * Call this event, then invoke the file selector (SNS). It will invoke click on some input, then let's replace with the result.
     */
    hookInputUploadOnce: [format: string, fileName: string, file: number[], triggerOnActiveElementNow: boolean]

    // #region web3 bridge
    /** Request the bridge to listen on an event. */
    web3BridgeBindEvent: [path: string, responseEventName: keyof InternalEvents, eventName: string]
    /** When a event happened. */
    web3BridgeEmitEvent: [path: string, eventName: string, data: unknown[]]
    /** Send JSON RPC request. */
    web3BridgeSendRequest: [path: string, req_id: number, request: unknown]
    /** Access primitive property on the window.ethereum object. */
    web3BridgePrimitiveAccess: [path: string, req_id: number, property: string]
    /** Wait until window.ethereum appears */
    web3UntilBridgeOnline: [path: string, req_id: number]
    /** Request the bridge to call function. */
    web3BridgeExecute: [path: string, req_id: number, opts?: unknown]
    sdk_ready: [undefined]
    // #endregion

    // Implemented by SDK
    requestDecrypt: [text: Record<string, string>, req_id: number]

    /** A simple RPC. */
    // Not using async-call-rpc because we need to make sure every intrinsic
    // we're using is captured.
    resolvePromise: [req_id: number, data: unknown]
    rejectPromise: [req_id: number, error: unknown]
}
export interface RequestArguments {
    method: string
    params?: any
    [key: string]: any
}
export interface EthereumProvider {
    /** Wait for ethereum object appears. */
    untilAvailable(): Promise<true>
    /** Send JSON RPC to the ethereum provider. */
    request(data: RequestArguments): Promise<unknown>
    /** Add event listener */
    on(event: string, callback: (...args: any) => void): () => void
    /** Remove event listener */
    off(event: string, callback: (...args: any) => void): void
    /** Access primitive property on the ethereum object. */
    getProperty(key: string): Promise<boolean | undefined>
}

export type EventItemBeforeSerialization = keyof InternalEvents extends infer U
    ? U extends keyof InternalEvents
        ? readonly [U, InternalEvents[U]]
        : never
    : never

export function encodeEvent<T extends keyof InternalEvents>(key: T, args: InternalEvents[T]) {
    // TODO: how to prevent toJSON()?
    return $.JSON.stringify([key, args])
}
export function decodeEvent(data: string): EventItemBeforeSerialization {
    const result = $.JSON.parse(data)
    if (!isEventItemBeforeSerialization(result)) throw new $.TypeError()
    return result
}

function isEventItemBeforeSerialization(data: unknown): data is EventItemBeforeSerialization {
    if (!$.isArray(data)) return false
    if (data.length !== 2) return false
    if (typeof data[0] !== 'string') return false
    if (!$.isArray(data[1])) return false
    return true
}
