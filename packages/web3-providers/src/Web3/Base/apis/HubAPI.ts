import type { HubBaseAPI_Base } from './HubBaseAPI.js'
import type { HubFungibleAPI_Base } from './HubFungibleAPI.js'
import type { HubNonFungibleAPI_Base } from './HubNonFungibleAPI.js'

export type HubAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    Transaction,
    TransactionParameter,
    GasOption,
> = HubBaseAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    Transaction,
    TransactionParameter,
    GasOption
> &
    HubFungibleAPI_Base<
        ChainId,
        SchemaType,
        ProviderType,
        NetworkType,
        RequestArguments,
        Transaction,
        TransactionParameter
    > &
    HubNonFungibleAPI_Base<
        ChainId,
        SchemaType,
        ProviderType,
        NetworkType,
        RequestArguments,
        Transaction,
        TransactionParameter
    >
