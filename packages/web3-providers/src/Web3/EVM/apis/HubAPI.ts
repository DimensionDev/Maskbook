import { mixin } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { HubBaseAPI } from './HubBaseAPI.js'
import { HubFungibleAPI } from './HubFungibleAPI.js'
import { HubNonFungibleAPI } from './HubNonFungibleAPI.js'
import type { HubOptions_Base } from '../../../entry-types.js'

export class HubAPI {
    create(initial?: HubOptions_Base<ChainId>) {
        return mixin(new HubBaseAPI(initial), new HubFungibleAPI(initial), new HubNonFungibleAPI(initial))
    }
}
