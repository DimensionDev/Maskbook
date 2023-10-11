import type { WalletAPI } from '../../../entry-types.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    type ChainId,
    isValidAddress,
    isValidChainId,
    getInvalidChainId,
    NetworkType,
    type ProviderType,
    type Web3,
    type Web3Provider,
    getDefaultChainId,
    getDefaultProviderType,
    getDefaultNetworkType,
} from '@masknet/web3-shared-flow'
import { FlowProviders } from '../providers/index.js'
import { FlowChainResolverAPI } from '../apis/ResolverAPI.js'
import { ProviderState } from '../../Base/state/Provider.js'

export class Provider extends ProviderState<ChainId, ProviderType, NetworkType, Web3Provider, Web3> {
    constructor(override context: WalletAPI.IOContext) {
        super(context, FlowProviders, {
            pluginID: NetworkPluginID.PLUGIN_FLOW,
            isSameAddress,
            isValidChainId,
            getInvalidChainId,
            isValidAddress,
            getDefaultChainId,
            getDefaultProviderType,
            getDefaultNetworkType,
            getNetworkTypeFromChainId: (chainId: ChainId) =>
                new FlowChainResolverAPI().networkType(chainId) ?? NetworkType.Flow,
        })
    }
}
