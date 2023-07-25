import { identity, pickBy } from 'lodash-es'
import type { NetworkPluginID, PageIndicator, PartialRequired, ValueRefWithReady } from '@masknet/shared-base'
import { CurrencyType, type SourceType, type Web3State } from '@masknet/web3-shared-base'
import { type SchemaType } from '@masknet/web3-shared-evm'
import type { OthersAPI_Base } from './OthersAPI.js'

export interface HubOptions_Base<ChainId, Indicator = PageIndicator> {
    /** The user account as the API parameter */
    account?: string
    /** The chain id as the API parameter */
    chainId?: ChainId
    /** The networkPluginID as the API parameter */
    networkPluginId?: NetworkPluginID
    /** The id of data provider */
    sourceType?: SourceType
    /** The schema type of filtered data */
    schemaType?: SchemaType
    /** The currency type of data */
    currencyType?: CurrencyType
    /** The item size of each page. */
    size?: number
    /** The page index. */
    indicator?: Indicator
    allChains?: boolean
}

export class HubOptionsAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
    Transaction,
    TransactionParameter,
> {
    constructor(private options?: HubOptions_Base<ChainId>) {}

    get Web3StateRef(): ValueRefWithReady<
        Web3State<
            ChainId,
            SchemaType,
            ProviderType,
            NetworkType,
            RequestArguments,
            RequestOptions,
            Transaction,
            TransactionParameter
        >
    > {
        throw new Error('To be implemented.')
    }

    get Web3Others(): OthersAPI_Base<ChainId, SchemaType, ProviderType, NetworkType, Transaction> {
        throw new Error('To be implemented.')
    }

    protected get defaults(): PartialRequired<HubOptions_Base<ChainId>, 'account' | 'chainId'> {
        return {
            account: '',
            chainId: this.Web3Others.getDefaultChainId(),
            networkPluginId: this.Web3Others.getNetworkPluginID(),
            currencyType: CurrencyType.USD,
            size: 50,
        }
    }

    protected get refs(): HubOptions_Base<ChainId> {
        if (!this.Web3StateRef.value) return {}
        return {
            account: this.Web3StateRef.value.Provider?.account?.getCurrentValue(),
            chainId: this.Web3StateRef.value.Provider?.chainId?.getCurrentValue(),
            currencyType: this.Web3StateRef.value.Settings?.currencyType?.getCurrentValue(),
        }
    }

    fill(initial?: HubOptions_Base<ChainId>): PartialRequired<HubOptions_Base<ChainId>, 'account' | 'chainId'> {
        return {
            ...this.defaults,
            ...this.refs,
            ...this.options,
            ...pickBy(initial, identity),
        }
    }
}
