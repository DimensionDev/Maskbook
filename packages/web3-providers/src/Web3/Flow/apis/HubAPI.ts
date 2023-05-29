import { mixin } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-flow'
import { FlowHubBaseAPI } from './HubBaseAPI.js'
import { FlowHubFungibleAPI } from './HubFungibleAPI.js'
import { FlowHubNonFungibleAPI } from './HubNonFungibleAPI.js'
import type { HubOptions_Base } from '../../../entry-types.js'

export class FlowHubAPI {
    create(initial?: HubOptions_Base<ChainId>) {
        return mixin(new FlowHubBaseAPI(initial), new FlowHubFungibleAPI(initial), new FlowHubNonFungibleAPI(initial))
    }
}
