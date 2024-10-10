/// <reference path="../public-api/index.ts" />
import type { MaskEthereumProviderRpcError } from './error.js'
export interface BridgeAPI {
    eth_request(request: unknown): Promise<{ e?: MaskEthereumProviderRpcError | null; d?: unknown }>
    reload(): Promise<void>
}
export interface UserScriptAPI {
    // When User script loaded, content script is not loaded. We must _be_ called to make sure CS has loaded.
    request_init(init: InitInformation): Promise<void>
    eth_message(message: unknown): Promise<void>
}
export interface InitInformation {
    debuggerMode: boolean
}
export { encoder } from './serializer.js'
export { createMaskSDKChannel } from './channel.js'
export type * from './types.js'
export * from './error.js'
export * from './error-generated.js'
