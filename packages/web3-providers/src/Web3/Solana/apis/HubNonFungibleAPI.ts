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
import { MagicEdenAPI } from '../../../MagicEden/index.js'
import { SolanaNonFungibleTokenAPI } from './NonFungibleTokenAPI.js'
import { NFTScanNonFungibleTokenAPI_Solana } from '../../../NFTScan/index.js'
import { SimpleHashAPI_Solana } from '../../../SimpleHash/index.js'
import type { NonFungibleTokenAPI } from '../../../entry-types.js'

const MagicEden = new MagicEdenAPI()
const SolanaNonFungible = new SolanaNonFungibleTokenAPI()
const NFTScanNonFungibleTokenSolana = new NFTScanNonFungibleTokenAPI_Solana()
const SimpleHashSolana = new SimpleHashAPI_Solana()

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
