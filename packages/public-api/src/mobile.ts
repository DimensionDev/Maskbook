import type { JsonRpcPayload, JsonRpcResponse } from './types'

/**
 * APIs that both Android and iOS implements and have the same API signature
 */
export interface SharedNativeAPIs {
    /**
     * Send Ethereum JSON RPC
     */
    send(payload: JsonRpcPayload): Promise<JsonRpcResponse>
    wallet_switchBlockChain(payload: { coinId?: number; networkId: number }): Promise<void>
    misc_openCreateWalletView(): Promise<void>
    misc_openDashboardView(): Promise<void>
}
/**
 * APIs that only implemented by iOS Mask Network
 */
export interface iOSNativeAPIs extends SharedNativeAPIs {}
/**
 * APIs that only implemented by Android Mask Network
 */
export interface AndroidNativeAPIs extends SharedNativeAPIs {
    sendJson(payload: string): Promise<string>
}
