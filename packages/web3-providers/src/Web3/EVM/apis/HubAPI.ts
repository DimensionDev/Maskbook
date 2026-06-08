import { mixin } from '@masknet/shared-base'
import type { Web3Definition } from '@masknet/web3-shared-evm'
import { createHubMemoized } from '../../Base/apis/createHubMemoized.js'
import type { BaseHubOptions } from '../../Base/apis/HubOptions.js'
import { EVMBaseHub } from './HubBaseAPI.js'
import { HubFungibleAPI } from './HubFungibleAPI.js'

export const createHub = createHubMemoized((initial?: BaseHubOptions<Web3Definition['ChainId']>) => {
    return mixin(new EVMBaseHub(initial), new HubFungibleAPI(initial))
})
export const EVMHub = createHub()
