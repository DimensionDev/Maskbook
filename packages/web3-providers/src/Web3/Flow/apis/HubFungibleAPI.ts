import { SourceType } from '@masknet/web3-shared-base'
import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-flow'
import { FlowFungible } from './FungibleTokenAPI.js'
import { FlowConnectionAPI } from './ConnectionAPI.js'
import { FlowHubOptionsAPI } from './HubOptionsAPI.js'
import { HubFungibleAPI_Base } from '../../Base/apis/HubFungibleAPI.js'
import type { HubOptions_Base } from '../../Base/apis/HubOptionsAPI.js'
import type { FungibleTokenAPI } from '../../../entry-types.js'

export class FlowHubFungibleAPI extends HubFungibleAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
> {
    private FlowWeb3 = new FlowConnectionAPI()

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

    public override getFungibleToken(address: string, initial?: HubOptions_Base<ChainId>) {
        return this.FlowWeb3.getFungibleToken(address, initial)
    }
}
