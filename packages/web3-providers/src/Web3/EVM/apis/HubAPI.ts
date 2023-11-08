import { mixin } from '@masknet/shared-base'
import { HubBaseAPI } from './HubBaseAPI.js'
import { HubFungibleAPI } from './HubFungibleAPI.js'
import { HubNonFungibleAPI } from './HubNonFungibleAPI.js'
import { createHubMemoized } from '../../Base/apis/HubCreatorAPI.js'
import type { HubOptions_Base } from '../../Base/apis/HubOptionsAPI.js'
import type { Web3Definition } from '@masknet/web3-shared-evm'

export const createHub = createHubMemoized((initial?: HubOptions_Base<Web3Definition['ChainId']>) => {
    return mixin(new HubBaseAPI(initial), new HubFungibleAPI(initial), new HubNonFungibleAPI(initial))
})
export const DefaultHub = createHub()
