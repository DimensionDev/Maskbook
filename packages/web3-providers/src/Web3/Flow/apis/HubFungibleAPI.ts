import { FlowFungible } from '@masknet/web3-providers'
import type { FungibleTokenAPI } from '@masknet/web3-providers/types'
import { SourceType } from '@masknet/web3-shared-base'
import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-flow'
import { FlowHubOptionsAPI } from './HubOptionsAPI.js'
import { HubFungibleAPI_Base } from '../../Base/apis/HubFungibleAPI.js'
import type { HubOptions_Base } from '../../Base/apis/HubOptionsAPI.js'

export class FlowHubFungibleAPI extends HubFungibleAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
    Transaction,
    TransactionParameter
> {
    protected override HubOptions = new FlowHubOptionsAPI(this.options)

    protected override getProviders(initial?: HubOptions_Base<ChainId>) {
        return this.getPredicateProviders<FungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.Flow]: FlowFungible,
            },
            [FlowFungible],
            initial,
        )
    }
}
