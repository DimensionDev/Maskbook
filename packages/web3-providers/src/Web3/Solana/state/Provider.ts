import { isSameAddress } from '@masknet/web3-shared-base'
import {
    isValidChainId,
    getInvalidChainId,
    isValidAddress,
    type ChainId,
    NetworkType,
    type ProviderType,
    getDefaultChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
} from '@masknet/web3-shared-solana'
import { createSolanaWalletProviders } from '../providers/index.js'
import { SolanaChainResolver } from '../apis/ResolverAPI.js'
import { ProviderState, type ProviderStorage } from '../../Base/state/Provider.js'
import type { WalletAPI } from '../../../entry-types.js'
import type { Account, StorageObject } from '@masknet/shared-base'

export class SolanaProvider extends ProviderState<ChainId, ProviderType, NetworkType> {
    constructor(
        signWithPersona: WalletAPI.SignWithPersona,
        storage: StorageObject<ProviderStorage<Account<ChainId>, ProviderType>>,
    ) {
        super(signWithPersona, storage)
        this.init()
    }
    public providers = createSolanaWalletProviders()
    protected isValidAddress = isValidAddress
    protected isValidChainId = isValidChainId
    protected isSameAddress = isSameAddress
    protected getInvalidChainId = getInvalidChainId
    protected getDefaultNetworkType = getDefaultNetworkType
    protected getDefaultProviderType = getDefaultProviderType
    protected getDefaultChainId = getDefaultChainId
    protected getNetworkTypeFromChainId(chainId: ChainId): NetworkType {
        return SolanaChainResolver.networkType(chainId) ?? NetworkType.Solana
    }
}
