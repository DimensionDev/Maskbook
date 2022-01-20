import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'

export const CustomEventId = 'c8a6c18e-f6a3-472a-adf3-5335deb80db6'
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
    hookInputUploadOnce: [format: string, fileName: string, file: number[]]

    // #region Eth inpage provider bridge
    /** Request the bridge to listen on an event. */
    ethBridgeRequestListen: [eventName: string]
    /** When a event happened. */
    ethBridgeOnEvent: [eventName: string, data: unknown[]]
    /** Send JSON RPC request. */
    ethBridgeSendRequest: [req_id: number, request: unknown]
    /** Access primitive property on the window.ethereum object. */
    ethBridgePrimitiveAccess: [req_id: number, property: string]
    /** Wait until window.ethereum appears */
    untilEthBridgeOnline: [req_id: number]
    // #endregion

    // #region Eth inpage provider bridge
    /** Request the bridge to listen on an event. */
    coin98BridgeRequestListen: [eventName: string]
    /** When a event happened. */
    coin98BridgeOnEvent: [eventName: string, data: unknown[]]
    /** Send JSON RPC request. */
    coin98BridgeSendRequest: [req_id: number, request: unknown]
    /** Access primitive property on the window.ethereum object. */
    coin98BridgePrimitiveAccess: [req_id: number, property: string]
    /** Wait until window.ethereum appears */
    untilCoin98BridgeOnline: [req_id: number]
    // #endregion

    // #region Solana inpage provider bridge
    /** Request the bridge to call function. */
    solanaBridgeExecute: [path: string, req_id: number]
    /** Request the bridge to listen on an event. */
    solanaBridgeRequestListen: [eventName: string]
    /** When a event happened. */
    solanaBridgeOnEvent: [eventName: string, data: unknown[]]
    /** Send JSON RPC request. */
    solanaBridgeSendRequest: [req_id: number, request: unknown]
    /** Access primitive property on the window.solana object. */
    solanaBridgePrimitiveAccess: [req_id: number, property: string]
    /** Wait until window.solana appears */
    untilSolanaBridgeOnline: [req_id: number]
    // #endregion

    /** A simple RPC. */
    // Not using async-call-rpc because we need to make sure every intrinsics
    // we're using is captured.
    resolvePromise: [req_id: number, data: unknown]
    rejectPromise: [req_id: number, error: unknown]
}

export interface EthereumProvider {
    /** Wait for ethereum object appears. */
    untilAvailable(): Promise<true>
    /** Send JSON RPC to the ethereum provider. */
    request(data: RequestArguments): Promise<unknown>
    /** Send JSON RPC  */
    send(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void
    /** Async send JSON RPC  */
    sendAsync(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void
    /** Add event listener */
    on(event: string, callback: (...args: any) => void): () => void
    /** Access primitive property on the ethereum object. */
    getProperty(key: string): Promise<boolean | undefined>
}

export type EventItemBeforeSerialization = keyof InternalEvents extends infer U
    ? U extends keyof InternalEvents
        ? readonly [U, InternalEvents[U]]
        : never
    : never
const { parse, stringify } = JSON
const { isArray } = Array
export function encodeEvent<T extends keyof InternalEvents>(key: T, args: InternalEvents[T]) {
    return stringify([key, args])
}
export function decodeEvent(data: string): EventItemBeforeSerialization {
    const result = parse(data)
    // Do not throw new Error cause it requires a global lookup.
    // eslint-disable-next-line
    if (!isEventItemBeforeSerialization(result)) throw null
    return result
}

function isEventItemBeforeSerialization(data: unknown): data is EventItemBeforeSerialization {
    if (!isArray(data)) return false
    if (data.length !== 2) return false
    if (typeof data[0] !== 'string') return false
    if (!isArray(data[1])) return false
    return true
}
