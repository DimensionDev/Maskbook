import { mixin } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-solana'
import { SolanaHubBaseAPI } from './HubBaseAPI.js'
import { SolanaHubFungibleAPI } from './HubFungibleAPI.js'
import { SolanaHubNonFungibleAPI } from './HubNonFungibleAPI.js'
import type { HubOptions_Base } from '../../../entry-types.js'

export class SolanaHubAPI {
    create(initial?: HubOptions_Base<ChainId>) {
        return mixin(
            new SolanaHubBaseAPI(initial),
            new SolanaHubFungibleAPI(initial),
            new SolanaHubNonFungibleAPI(initial),
        )
    }
}
