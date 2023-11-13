import type { Web3Definition } from '@masknet/web3-shared-solana'
import { createHubMemoized } from '../../Base/apis/createHubMemoized.js'
import type { BaseHubOptions } from '../../Base/apis/HubOptions.js'
import { SolanaBaseHub } from './HubBaseAPI.js'
import { SolanaHubFungibleAPI } from './HubFungibleAPI.js'
import { SolanaHubNonFungibleAPI } from './HubNonFungibleAPI.js'
import { mixin } from '@masknet/shared-base'

export const createSolanaHub = createHubMemoized((initial?: BaseHubOptions<Web3Definition['ChainId']>) => {
    return mixin(new SolanaBaseHub(initial), new SolanaHubFungibleAPI(initial), new SolanaHubNonFungibleAPI(initial))
})
