import { identity, pickBy } from 'lodash-es'
import type { GasOptionType, ProviderState } from '@masknet/web3-shared-base'
import type { ECKeyIdentifier, PartialRequired } from '@masknet/shared-base'

export interface BaseConnectionOptions<ChainId, ProviderType, Transaction> {
    /** Designate the signer of the transaction. */
    account?: string
    /** Designate the sub-network id of the transaction. */
    chainId?: ChainId
    /** an abstract wallet has a owner */
    owner?: string
    /** persona identifier */
    identifier?: ECKeyIdentifier
    /** Designate the provider to handle the transaction. */
    providerType?: ProviderType
    /** Custom network rpc url. */
    providerURL?: string
    /** Gas payment token. */
    paymentToken?: string
    /** Only Support Mask Wallet, silent switch wallet */
    silent?: boolean
    /** Accessing data from chain directly w/o middleware, the default value is true  */
    readonly?: boolean
    /** Fragments to merge into the transaction. */
    overrides?: Partial<Transaction>
    /** Termination signal */
    signal?: AbortSignal
    /** Gas option type */
    gasOptionType?: GasOptionType
}

export abstract class ConnectionOptionsProvider<ChainId, ProviderType, NetworkType, Transaction> {
    protected abstract getDefaultChainId(): ChainId
    protected abstract getDefaultProviderType(): ProviderType
    protected abstract getProvider?(): undefined | ProviderState<ChainId, ProviderType, NetworkType>

    constructor(private options?: BaseConnectionOptions<ChainId, ProviderType, Transaction>) {}

    protected get defaults() {
        return {
            account: '',
            chainId: this.getDefaultChainId(),
            providerType: this.getDefaultProviderType(),
        }
    }

    protected get refs(): BaseConnectionOptions<ChainId, ProviderType, Transaction> {
        const provider = this.getProvider?.()
        if (!provider) return {}
        return {
            account: provider.account?.getCurrentValue(),
            chainId: provider.chainId?.getCurrentValue(),
            providerType: provider.providerType?.getCurrentValue(),
        }
    }

    fill(
        initials?: BaseConnectionOptions<ChainId, ProviderType, Transaction>,
        overrides?: Partial<Transaction>,
    ): PartialRequired<
        BaseConnectionOptions<ChainId, ProviderType, Transaction>,
        'account' | 'chainId' | 'providerType'
    > {
        return {
            ...this.defaults,
            ...this.refs,
            ...pickBy(this.options, identity),
            ...pickBy(initials, identity),
            overrides: {
                ...pickBy(this.refs.overrides, identity),
                ...pickBy(this.options?.overrides, identity),
                ...pickBy(initials?.overrides, identity),
                ...pickBy(overrides, identity),
            } as Partial<Transaction>,
        }
    }
}
