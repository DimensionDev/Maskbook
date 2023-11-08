import type { HubBaseAPI_Base } from './HubBaseAPI.js'
import type { HubFungibleAPI_Base } from './HubFungibleAPI.js'
import type { HubNonFungibleAPI_Base } from './HubNonFungibleAPI.js'

export type HubAPI_Base<ChainId, SchemaType, GasOption> = HubBaseAPI_Base<ChainId, SchemaType, GasOption> &
    HubFungibleAPI_Base<ChainId, SchemaType> &
    HubNonFungibleAPI_Base<ChainId, SchemaType>
