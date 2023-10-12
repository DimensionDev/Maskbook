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
import { FlowChainResolver } from '../apis/ResolverAPI.js'
import { ProviderState } from '../../Base/state/Provider.js'
import type { WalletAPI } from '../../../entry-types.js'

export class Provider extends ProviderState<ChainId, ProviderType, NetworkType, Web3Provider, Web3> {
    protected override providers = FlowProviders
    protected override isValidAddress = isValidAddress
    protected override isValidChainId = isValidChainId
    protected override isSameAddress = isSameAddress
    protected override getInvalidChainId = getInvalidChainId
    protected override getDefaultNetworkType = getDefaultNetworkType
    protected override getDefaultProviderType = getDefaultProviderType
    protected override getDefaultChainId = getDefaultChainId
    protected override getNetworkTypeFromChainId(chainId: ChainId): NetworkType {
        return FlowChainResolver.networkType(chainId) ?? NetworkType.Flow
    }
    private constructor(io: WalletAPI.IOContext) {
        super(io)
    }
    storage = ProviderState.createStorage(NetworkPluginID.PLUGIN_FLOW, getDefaultChainId(), getDefaultProviderType())

    static async new(io: WalletAPI.IOContext) {
        const provider = new this(io)
        await provider.setup()
        return provider
    }
}
