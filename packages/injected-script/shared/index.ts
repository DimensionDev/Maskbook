export const CustomEventId = '413f832d-db5c-4779-8d7e-1f7127bd167b'
export interface InternalEvents {
    /** Simulate a paste event on the activeElement */
    paste: [text: string]
    /** Simulate an image paste event on the activeElement */
    pasteImage: [image: number[]]
    /** Simulate a input event on the activeElement */
    input: [text: string]
    /** Simulate a image upload on the activeElement on instagram */
    instagramUpload: [image: number[]]
    /**
     * Simulate an image upload event.
     *
     * How to use:
     * Call this event, then invoke the file selector (for now it's instagram). It will invoke click on some input, then let's replace with the result.
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
    // #endregion

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

export type EventItemBeforeSerialization =
    keyof InternalEvents extends infer U ?
        U extends keyof InternalEvents ?
            readonly [U, InternalEvents[U]]
        :   never
    :   never
const { parse, stringify } = JSON
const { isArray } = Array
const { setPrototypeOf } = Object
const { String } = globalThis
export function encodeEvent(key: string, args: unknown[]) {
    return stringify(setPrototypeOf([key, args], null), function formatter(key: string, value: unknown) {
        if (value instanceof Uint8Array) return { $type: 'u8[]', value: [...value] }
        return value
    })
}

export function decodeEvent(data: unknown) {
    const result = parse(String(data), function reviver(key: string, value: unknown) {
        if (
            typeof value === 'object' &&
            value &&
            '$type' in value &&
            'value' in value &&
            isArray(value.value) &&
            value.$type === 'u8[]'
        )
            return new Uint8Array(value.value)
        return value
    })
    // Do not throw new Error cause it requires a global lookup.
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
export * from './twitter.js'
