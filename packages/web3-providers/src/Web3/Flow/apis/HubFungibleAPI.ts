import { SourceType } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-flow'
import { FlowFungible } from './FungibleTokenAPI.js'
import { FlowConnectionAPI } from './ConnectionAPI.js'
import { FlowHubOptionsAPI } from './HubOptionsAPI.js'
import { BaseHubFungible } from '../../Base/apis/HubFungible.js'
import type { BaseHubOptions } from '../../Base/apis/HubOptions.js'
import type { FungibleTokenAPI } from '../../../entry-types.js'

export class FlowHubFungibleAPI extends BaseHubFungible<ChainId, SchemaType> {
    private FlowWeb3 = new FlowConnectionAPI()

    protected override HubOptions = new FlowHubOptionsAPI(this.options)

    protected override getProvidersFungible(initial?: BaseHubOptions<ChainId>) {
        return this.getPredicateProviders<FungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.Flow]: FlowFungible,
            },
            [FlowFungible],
            initial,
        )
    }

    public override getFungibleToken(address: string, initial?: BaseHubOptions<ChainId>) {
        return this.FlowWeb3.getFungibleToken(address, initial)
    }
}
