import { mixin } from '@masknet/shared-base'
import { createHubMemoized } from '../../Base/apis/HubCreatorAPI.js'
import { FlowHubBaseAPI } from './HubBaseAPI.js'
import { FlowHubFungibleAPI } from './HubFungibleAPI.js'
import { FlowHubNonFungibleAPI } from './HubNonFungibleAPI.js'
import type { Web3Definition } from '@masknet/web3-shared-flow'
import type { HubOptions_Base } from '../../Base/apis/HubOptionsAPI.js'

export const createFlowHub = createHubMemoized((initial?: HubOptions_Base<Web3Definition['ChainId']>) => {
    return mixin(new FlowHubBaseAPI(initial), new FlowHubFungibleAPI(initial), new FlowHubNonFungibleAPI(initial))
})
