import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-solana'
import { SourceType } from '@masknet/web3-shared-base'
import { HubNonFungibleAPI_Base } from '../../Base/apis/HubNonFungibleAPI.js'
import type { HubOptions_Base } from '../../Base/apis/HubOptionsAPI.js'
import { SolanaHubOptionsAPI } from './HubOptionsAPI.js'
import { MagicEden } from '../../../MagicEden/index.js'
import { SolanaNonFungible } from './NonFungibleTokenAPI.js'
import { NFTScanNonFungibleTokenSolana } from '../../../NFTScan/index.js'
import { SimpleHashSolana } from '../../../SimpleHash/index.js'
import type { NonFungibleTokenAPI } from '../../../entry-types.js'

export class SolanaHubNonFungibleAPI extends HubNonFungibleAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
> {
    protected override HubOptions = new SolanaHubOptionsAPI(this.options)

    protected override getProviders(initial?: HubOptions_Base<ChainId>) {
        return this.getPredicateProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.MagicEden]: MagicEden,
                [SourceType.Solana]: SolanaNonFungible,
                [SourceType.NFTScan]: NFTScanNonFungibleTokenSolana,
                [SourceType.SimpleHash]: SimpleHashSolana,
            },
            [SimpleHashSolana, NFTScanNonFungibleTokenSolana, MagicEden, SolanaNonFungible],
            initial,
        )
    }
}
