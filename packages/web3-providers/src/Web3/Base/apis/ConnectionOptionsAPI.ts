import { identity, pickBy } from 'lodash-es'
import type { Web3State } from '@masknet/web3-shared-base'
import type { ECKeyIdentifier, PartialRequired, ValueRefWithReady } from '@masknet/shared-base'
import type { OthersAPI_Base } from './OthersAPI.js'

export interface ConnectionOptions_Base<ChainId, ProviderType, Transaction> {
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
}

export class ConnectionOptionsAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    Transaction,
    TransactionParameter,
> {
    constructor(private options?: ConnectionOptions_Base<ChainId, ProviderType, Transaction>) {}

    get Web3StateRef(): ValueRefWithReady<
        Web3State<ChainId, SchemaType, ProviderType, NetworkType, Transaction, TransactionParameter> | undefined
    > {
        throw new Error('To be implemented.')
    }

    get Web3Others(): OthersAPI_Base<ChainId, SchemaType, ProviderType, NetworkType, Transaction> {
        throw new Error('To be implemented.')
    }

    protected get defaults(): PartialRequired<
        ConnectionOptions_Base<ChainId, ProviderType, Transaction>,
        'account' | 'chainId' | 'providerType'
    > {
        return {
            account: '',
            chainId: this.Web3Others.getDefaultChainId(),
            providerType: this.Web3Others.getDefaultProviderType(),
        }
    }

    protected get refs(): ConnectionOptions_Base<ChainId, ProviderType, Transaction> | undefined {
        if (!this.Web3StateRef.value) return
        return {
            account: this.Web3StateRef.value.Provider?.account?.getCurrentValue(),
            chainId: this.Web3StateRef.value.Provider?.chainId?.getCurrentValue(),
            providerType: this.Web3StateRef.value.Provider?.providerType?.getCurrentValue(),
        }
    }

    fill(
        initials?: ConnectionOptions_Base<ChainId, ProviderType, Transaction>,
        overrides?: Partial<Transaction>,
    ): PartialRequired<
        ConnectionOptions_Base<ChainId, ProviderType, Transaction>,
        'account' | 'chainId' | 'providerType'
    > {
        return {
            ...this.defaults,
            ...this.refs,
            ...pickBy(this.options, identity),
            ...pickBy(initials, identity),
            overrides: {
                ...this.defaults.overrides,
                ...pickBy(this.refs?.overrides, identity),
                ...pickBy(this.options?.overrides, identity),
                ...pickBy(overrides, identity),
            },
        }
    }
}
