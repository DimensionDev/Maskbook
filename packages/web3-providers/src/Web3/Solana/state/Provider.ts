import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    isValidChainId,
    getInvalidChainId,
    isValidAddress,
    chainResolver,
    type ChainId,
    NetworkType,
    type ProviderType,
    type Web3Provider,
    type Web3,
    getDefaultChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
} from '@masknet/web3-shared-solana'
import { SolanaProviders } from '@masknet/web3-providers'
import { ProviderState } from '../../Base/state/Provider.js'

export class Provider extends ProviderState<ChainId, ProviderType, NetworkType, Web3Provider, Web3> {
    constructor(override context: Plugin.Shared.SharedUIContext) {
        super(context, SolanaProviders, {
            pluginID: NetworkPluginID.PLUGIN_SOLANA,
            isSameAddress,
            isValidChainId,
            getInvalidChainId,
            isValidAddress,
            getDefaultChainId,
            getDefaultNetworkType,
            getDefaultProviderType,
            getNetworkTypeFromChainId: (chainId: ChainId) => chainResolver.networkType(chainId) ?? NetworkType.Solana,
        })
    }
}
