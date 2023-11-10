import { mixin } from '@masknet/shared-base'
import { EVMBaseHub } from './HubBaseAPI.js'
import { HubFungibleAPI } from './HubFungibleAPI.js'
import { HubNonFungibleAPI } from './HubNonFungibleAPI.js'
import { createHubMemoized } from '../../Base/apis/createHubMemoized.js'
import type { BaseHubOptions } from '../../Base/apis/HubOptions.js'
import type { Web3Definition } from '@masknet/web3-shared-evm'

export const createHub = createHubMemoized((initial?: BaseHubOptions<Web3Definition['ChainId']>) => {
    return mixin(new EVMBaseHub(initial), new HubFungibleAPI(initial), new HubNonFungibleAPI(initial))
})
export const EVMHub = createHub()
