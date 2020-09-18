import type { WalletDetails } from '../../extension/background-script/PluginService'
export enum WalletProviderType {
    managed = 'managed',
    metamask = 'metamask',
    wallet_connect = 'wallet_connect',
}
export function findOutWalletProvider(rec: WalletDetails) {
    if (rec.type === 'managed') return WalletProviderType.managed
    return rec.provider
}
