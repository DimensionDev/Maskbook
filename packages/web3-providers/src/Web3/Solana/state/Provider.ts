import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    isValidChainId,
    getInvalidChainId,
    isValidAddress,
    type ChainId,
    NetworkType,
    type ProviderType,
    type Web3Provider,
    type Web3,
    getDefaultChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
} from '@masknet/web3-shared-solana'
import { SolanaProviders } from '../providers/index.js'
import { SolanaChainResolver } from '../apis/ResolverAPI.js'
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
            getNetworkTypeFromChainId: (chainId: ChainId) =>
                SolanaChainResolver.networkType(chainId) ?? NetworkType.Solana,
        })
    }
}
