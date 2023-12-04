/// <reference path="../public-api/index.ts" />
import type { MaskEthereumProviderRpcError } from './error.js'
export interface BridgeAPI {
    eth_request(request: unknown): Promise<{ e?: MaskEthereumProviderRpcError | null; d?: unknown }>
    reload(): Promise<void>
}
export interface UserScriptAPI {
    // When User script loaded, content script is not loaded. We must _be_ called to make sure CS has loaded.
    request_init(init: InitInformation): Promise<void>
}
export interface InitInformation {
    debuggerMode: boolean
}
export { serializer } from './serializer.js'
export { createMaskSDKChannel } from './channel.js'
export * from './types.js'
export { MaskEthereumProviderRpcError } from './error.js'
