/**
 * JSON RPC calls that can be called from the native side.
 * JS = server, native = client
 */
export interface WebviewAPIs {}
export interface SharedNativeAPIs {}
/**
 * JSON RPC calls that can be called if it is running on iOS.
 * JS = client, iOS = server
 */
export interface iOSNativeAPIs extends SharedNativeAPIs {
    scanQRCode(): Promise<string>
    log(...args: any[]): Promise<void>
}
/**
 * JSON RPC calls that can be called if it is running on iOS.
 * JS = client, Android = server
 */
export interface AndroidNativeAPIs extends SharedNativeAPIs {}
