import type { WalletDetails } from '../../extension/background-script/PluginService'
export enum WalletProviderType {
    managed = 'managed',
    metamask = 'metamask',
}
export function findOutWalletProvider(rec: WalletDetails) {
    if (rec.type === 'managed') return WalletProviderType.managed
    return rec.provider
}
