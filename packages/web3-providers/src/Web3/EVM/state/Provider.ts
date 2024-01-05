import {
    type ECKeyIdentifier,
    mapSubscription,
    mergeSubscription,
    type Account,
    type StorageObject,
} from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    type ChainId,
    isValidAddress,
    NetworkType,
    ProviderType,
    isValidChainId,
    getInvalidChainId,
    getDefaultChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
} from '@masknet/web3-shared-evm'
import { EVMChainResolver } from '../apis/ResolverAPI.js'
import { createEVMWalletProviders } from '../providers/index.js'
import { ProviderState, type ProviderStorage } from '../../Base/state/Provider.js'
import type { WalletAPI } from '../../../entry-types.js'
import type { BaseHostedStorage } from '../providers/BaseHosted.js'
import type { EIP4337ProviderStorage } from '../providers/BaseContractWallet.js'

export class EVMProvider extends ProviderState<ChainId, ProviderType, NetworkType> {
    constructor(
        context: WalletAPI.IOContext,
        storage: StorageObject<ProviderStorage<Account<ChainId>, ProviderType>>,
        hostedProviderStorage: BaseHostedStorage,
        eip4337Storage: EIP4337ProviderStorage,
    ) {
        super(context.signWithPersona, storage)
        this.providers = createEVMWalletProviders(context, hostedProviderStorage, eip4337Storage)
        this.init()
    }
    protected providers
    protected isValidAddress = isValidAddress
    protected isValidChainId = isValidChainId
    protected isSameAddress = isSameAddress
    protected getInvalidChainId = getInvalidChainId
    protected getDefaultNetworkType = getDefaultNetworkType
    protected getDefaultProviderType = getDefaultProviderType
    protected getDefaultChainId = getDefaultChainId
    protected getNetworkTypeFromChainId(chainId: ChainId) {
        return EVMChainResolver.networkType(chainId) ?? NetworkType.Ethereum
    }

    protected override async setupSubscriptions() {
        this.chainId = mapSubscription(
            mergeSubscription(this.storage.account.subscription),
            ([account]) => account.chainId,
        )
        this.account = mapSubscription(
            mergeSubscription(this.storage.account.subscription),
            ([account]) => account.account,
        )
        this.networkType = mapSubscription(mergeSubscription(this.storage.account.subscription), ([account]) => {
            return this.getNetworkTypeFromChainId(account.chainId)
        })
        this.providerType = mapSubscription(this.storage.providerType.subscription, (provider) => provider)
    }

    override async connect(
        providerType: ProviderType,
        chainId: ChainId,
        address?: string | undefined,
        owner?: {
            account: string
            identifier?: ECKeyIdentifier
        },
        silent?: boolean,
    ): Promise<Account<ChainId>> {
        // Disconnect WalletConnect, prevents its session lasting too long.
        if (providerType !== ProviderType.WalletConnect && this.providers[ProviderType.WalletConnect].connected) {
            try {
                await super.disconnect(ProviderType.WalletConnect)
            } catch {
                // do nothing
            }
        }

        return super.connect(providerType, chainId, address, owner, silent)
    }
}
