import type { LaunchPage } from '../../settings/types'
/**
 * JSON RPC calls that can be called from the native side.
 * JS = server, native = client
 */
export interface WebviewAPIs {
    web_echo<T>(arg: T): Promise<T>
    getDashboardURL(): Promise<string>
    /** Definition of LaunchPage see https://github.com/DimensionDev/Maskbook/blob/master/packages/maskbook/src/settings/types.ts */
    getSettings(key: 'launchPageSettings'): Promise<LaunchPage>
    getConnectedPersonas(): Promise<{ personas: { network: string; connected: boolean }[][] }>
}
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
