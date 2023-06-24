import { NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { ChainId, NetworkType, ProviderType } from '../types/index.js'

export function getNetworkPluginID() {
    return NetworkPluginID.PLUGIN_EVM
}

export function getDefaultChainId() {
    return ChainId.Mainnet
}

export function getInvalidChainId() {
    return ChainId.Invalid
}

export function getDefaultNetworkType() {
    return NetworkType.Ethereum
}

export function getDefaultProviderType() {
    return Sniffings.is_popup_page ? ProviderType.MaskWallet : ProviderType.None
}
