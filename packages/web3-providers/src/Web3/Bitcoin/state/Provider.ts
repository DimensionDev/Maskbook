import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    isValidBitcoinAddress,
    isValidChainId,
    getInvalidChainId,
    NetworkType,
    type ChainId,
    type ProviderType,
    type Web3,
    type Web3Provider,
    getDefaultChainId,
    getDefaultProviderType,
    getDefaultNetworkType,
} from '@masknet/web3-shared-bitcoin'
import { BitcoinProviders } from '@masknet/web3-providers'
import { BitcoinChainResolverAPI } from '../apis/ResolverAPI.js'
import { ProviderState } from '../../Base/state/Provider.js'

export class Provider extends ProviderState<ChainId, ProviderType, NetworkType, Web3Provider, Web3> {
    constructor(override context: Plugin.Shared.SharedUIContext) {
        super(context, BitcoinProviders, {
            pluginID: NetworkPluginID.PLUGIN_BITCOIN,
            isSameAddress,
            isValidChainId,
            getInvalidChainId,
            isValidAddress: isValidBitcoinAddress,
            getDefaultChainId,
            getDefaultProviderType,
            getDefaultNetworkType,
            getNetworkTypeFromChainId: (chainId: ChainId) =>
                new BitcoinChainResolverAPI().networkType(chainId) ?? NetworkType.Mainnet,
        })
    }
}
