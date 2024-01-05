import { isSameAddress } from '@masknet/web3-shared-base'
import {
    type ChainId,
    isValidAddress,
    isValidChainId,
    getInvalidChainId,
    NetworkType,
    type ProviderType,
    getDefaultChainId,
    getDefaultProviderType,
    getDefaultNetworkType,
} from '@masknet/web3-shared-flow'
import { createFlowWalletProviders } from '../providers/index.js'
import { FlowChainResolver } from '../apis/ResolverAPI.js'
import { ProviderState, type ProviderStorage } from '../../Base/state/Provider.js'
import type { WalletAPI } from '../../../entry-types.js'
import type { Account, StorageObject } from '@masknet/shared-base'

export class FlowProvider extends ProviderState<ChainId, ProviderType, NetworkType> {
    constructor(
        signWithPersona: WalletAPI.SignWithPersona,
        storage: StorageObject<ProviderStorage<Account<ChainId>, ProviderType>>,
    ) {
        super(signWithPersona, storage)
        this.init()
    }
    public providers = createFlowWalletProviders()
    protected isValidAddress = isValidAddress
    protected isValidChainId = isValidChainId
    protected isSameAddress = isSameAddress
    protected getInvalidChainId = getInvalidChainId
    protected getDefaultNetworkType = getDefaultNetworkType
    protected getDefaultProviderType = getDefaultProviderType
    protected getDefaultChainId = getDefaultChainId
    protected getNetworkTypeFromChainId(chainId: ChainId): NetworkType {
        return FlowChainResolver.networkType(chainId) ?? NetworkType.Flow
    }
}
