import { SourceType } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-flow'
import { FlowHubOptionsAPI } from './HubOptionsAPI.js'
import { BaseHubNonFungible } from '../../Base/apis/HubNonFungible.js'
import type { BaseHubOptions } from '../../Base/apis/HubOptions.js'
import * as AlchemyFlow from /* webpackDefer: true */ '../../../Alchemy/index.js'
import type { NonFungibleTokenAPI } from '../../../entry-types.js'

export class FlowHubNonFungibleAPI extends BaseHubNonFungible<ChainId, SchemaType> {
    protected override HubOptions = new FlowHubOptionsAPI(this.options)

    protected override getProvidersNonFungible(initial?: BaseHubOptions<ChainId>) {
        return this.getPredicateProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.Alchemy_FLOW]: AlchemyFlow.AlchemyFlow,
            },
            [AlchemyFlow.AlchemyFlow],
            initial,
        )
    }
}
