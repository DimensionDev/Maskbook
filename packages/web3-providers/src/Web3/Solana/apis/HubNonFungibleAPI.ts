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
    private MagicEden = new MagicEdenAPI()
    private SolanaNonFungible = new SolanaNonFungibleTokenAPI()
    private NFTScanNonFungibleTokenSolana = new NFTScanNonFungibleTokenAPI_Solana()
    private SimpleHashSolana = new SimpleHashAPI_Solana()

    protected override HubOptions = new SolanaHubOptionsAPI(this.options)

    protected override getProviders(initial?: HubOptions_Base<ChainId>) {
        return this.getPredicateProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.MagicEden]: this.MagicEden,
                [SourceType.Solana]: this.SolanaNonFungible,
                [SourceType.NFTScan]: this.NFTScanNonFungibleTokenSolana,
                [SourceType.SimpleHash]: this.SimpleHashSolana,
            },
            [this.SimpleHashSolana, this.NFTScanNonFungibleTokenSolana, this.MagicEden, this.SolanaNonFungible],
            initial,
        )
    }
}
