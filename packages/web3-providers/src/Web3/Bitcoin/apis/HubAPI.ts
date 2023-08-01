import { mixin } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-bitcoin'
import { BitcoinHubBaseAPI } from './HubBaseAPI.js'
import { BitcoinHubFungibleAPI } from './HubFungibleAPI.js'
import type { HubOptions_Base } from '../../../entry-types.js'

export class BitcoinHubAPI {
    create(initial?: HubOptions_Base<ChainId>) {
        return mixin(new BitcoinHubBaseAPI(initial), new BitcoinHubFungibleAPI(initial))
    }
}
