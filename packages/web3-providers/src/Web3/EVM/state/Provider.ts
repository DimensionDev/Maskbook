import type { WalletAPI } from '../../../entry-types.js'
import {
    type ECKeyIdentifier,
    mapSubscription,
    mergeSubscription,
    type Account,
    NetworkPluginID,
} from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    type ChainId,
    isValidAddress,
    NetworkType,
    ProviderType,
    type Web3,
    type Web3Provider,
    isValidChainId,
    getInvalidChainId,
    getDefaultChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
} from '@masknet/web3-shared-evm'
import { ChainResolver } from '../apis/ResolverAPI.js'
import { Providers } from '../providers/index.js'
import { ProviderState } from '../../Base/state/Provider.js'

export class Provider extends ProviderState<ChainId, ProviderType, NetworkType, Web3Provider, Web3> {
    protected providers = Providers
    protected override isValidAddress = isValidAddress
    protected override isValidChainId = isValidChainId
    protected override isSameAddress = isSameAddress
    protected override getInvalidChainId = getInvalidChainId
    protected override getDefaultNetworkType = getDefaultNetworkType
    protected override getDefaultProviderType = getDefaultProviderType
    protected override getDefaultChainId = getDefaultChainId
    protected override getNetworkTypeFromChainId(chainId: ChainId) {
        return ChainResolver.networkType(chainId) ?? NetworkType.Ethereum
    }

    constructor(io: WalletAPI.IOContext) {
        super(io, NetworkPluginID.PLUGIN_EVM, getDefaultChainId(), getDefaultProviderType())
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
