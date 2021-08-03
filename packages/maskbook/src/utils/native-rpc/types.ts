import type { NetworkType } from '@masknet/web3-shared'
import type { DataProvider, TradeProvider } from '../../plugins/Trader/types'
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
    getConnectedPersonas(): Promise<string>
    app_isPluginEnabled(id: string): Promise<boolean>
    app_setPluginStatus(id: string, enabled: boolean): void
    setting_getNetworkTraderProvider(network: NetworkType): Promise<TradeProvider>
    setting_setNetworkTraderProvider(network: NetworkType, provider: TradeProvider): void
    settings_getTrendingDataSource(): Promise<DataProvider>
    settings_setTrendingDataSource(provider: DataProvider): void
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
