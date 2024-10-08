import type { ChainId, SchemaType } from '@masknet/web3-shared-solana'
import { SourceType } from '@masknet/web3-shared-base'
import { BaseHubNonFungible } from '../../Base/apis/HubNonFungible.js'
import type { BaseHubOptions } from '../../Base/apis/HubOptions.js'
import { SolanaHubOptionsAPI } from './HubOptionsAPI.js'
import { NFTScanNonFungibleTokenSolana } from '../../../NFTScan/index.js'
import { SimpleHashSolana } from '../../../SimpleHash/index.js'
import type { NonFungibleTokenAPI } from '../../../entry-types.js'

export class SolanaHubNonFungibleAPI extends BaseHubNonFungible<ChainId, SchemaType> {
    protected override HubOptions = new SolanaHubOptionsAPI(this.options)

    protected override getProvidersNonFungible(initial?: BaseHubOptions<ChainId>) {
        return this.getPredicateProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.NFTScan]: NFTScanNonFungibleTokenSolana,
                [SourceType.SimpleHash]: SimpleHashSolana,
            },
            [SimpleHashSolana, NFTScanNonFungibleTokenSolana],
            initial,
        )
    }
}
