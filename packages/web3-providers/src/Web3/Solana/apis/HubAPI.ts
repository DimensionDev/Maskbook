import type { Web3Definition } from '@masknet/web3-shared-solana'
import { createHubMemoized } from '../../Base/apis/HubCreatorAPI.js'
import type { HubOptions_Base } from '../../Base/apis/HubOptionsAPI.js'
import { SolanaHubBaseAPI } from './HubBaseAPI.js'
import { SolanaHubFungibleAPI } from './HubFungibleAPI.js'
import { SolanaHubNonFungibleAPI } from './HubNonFungibleAPI.js'
import { mixin } from '@masknet/shared-base'

export const createSolanaHub = createHubMemoized((initial?: HubOptions_Base<Web3Definition['ChainId']>) => {
    return mixin(new SolanaHubBaseAPI(initial), new SolanaHubFungibleAPI(initial), new SolanaHubNonFungibleAPI(initial))
})
