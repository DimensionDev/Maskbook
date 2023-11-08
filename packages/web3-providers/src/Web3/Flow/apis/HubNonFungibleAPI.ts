import { SourceType } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-flow'
import { FlowHubOptionsAPI } from './HubOptionsAPI.js'
import { HubNonFungibleAPI_Base } from '../../Base/apis/HubNonFungibleAPI.js'
import type { HubOptions_Base } from '../../Base/apis/HubOptionsAPI.js'
import { AlchemyFlow } from '../../../Alchemy/index.js'
import type { NonFungibleTokenAPI } from '../../../entry-types.js'

export class FlowHubNonFungibleAPI extends HubNonFungibleAPI_Base<ChainId, SchemaType> {
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
