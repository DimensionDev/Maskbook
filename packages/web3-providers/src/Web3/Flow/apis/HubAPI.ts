import { mixin } from '@masknet/shared-base'
import { createHubMemoized } from '../../Base/apis/createHubMemoized.js'
import { FlowBaseHub } from './HubBaseAPI.js'
import { FlowHubFungibleAPI } from './HubFungibleAPI.js'
import { FlowHubNonFungibleAPI } from './HubNonFungibleAPI.js'
import type { Web3Definition } from '@masknet/web3-shared-flow'
import type { BaseHubOptions } from '../../Base/apis/HubOptions.js'

export const createFlowHub = createHubMemoized((initial?: BaseHubOptions<Web3Definition['ChainId']>) => {
    return mixin(new FlowBaseHub(initial), new FlowHubFungibleAPI(initial), new FlowHubNonFungibleAPI(initial))
})
