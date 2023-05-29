import { AlchemyFlow } from '@masknet/web3-providers'
import type { NonFungibleTokenAPI } from '@masknet/web3-providers/types'
import { SourceType } from '@masknet/web3-shared-base'
import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-flow'
import { FlowHubOptionsAPI } from './HubOptionsAPI.js'
import { HubNonFungibleAPI_Base } from '../../Base/apis/HubNonFungibleAPI.js'
import type { HubOptions_Base } from '../../Base/apis/HubOptionsAPI.js'

export class FlowHubNonFungibleAPI extends HubNonFungibleAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    Transaction,
    TransactionParameter
> {
    protected override HubOptions = new FlowHubOptionsAPI(this.options)

    protected override getProviders(initial?: HubOptions_Base<ChainId>) {
        return this.getPredicateProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.Alchemy_FLOW]: AlchemyFlow,
            },
            [AlchemyFlow],
            initial,
        )
    }
}
