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
import { SolanaWalletProviders } from '../providers/index.js'
import { SolanaChainResolver } from '../apis/ResolverAPI.js'
import { ProviderState } from '../../Base/state/Provider.js'

export class SolanaProvider extends ProviderState<ChainId, ProviderType, NetworkType, Web3Provider, Web3> {
    protected override providers = SolanaWalletProviders
    protected override isValidAddress = isValidAddress
    protected override isValidChainId = isValidChainId
    protected override isSameAddress = isSameAddress
    protected override getInvalidChainId = getInvalidChainId
    protected override getDefaultNetworkType = getDefaultNetworkType
    protected override getDefaultProviderType = getDefaultProviderType
    protected override getDefaultChainId = getDefaultChainId
    protected override getNetworkTypeFromChainId(chainId: ChainId): NetworkType {
        return SolanaChainResolver.networkType(chainId) ?? NetworkType.Solana
    }
}
