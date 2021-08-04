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
 * JSON RPC calls that can be called if it is running on Android.
 * JS = client, Android = server
 */
export interface AndroidNativeAPIs extends SharedNativeAPIs {
    android_echo(arg: string): Promise<string>
}
