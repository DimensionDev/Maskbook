import { MagicEden, SolanaNonFungible, NFTScanNonFungibleTokenSolana, SimpleHashSolana } from '@masknet/web3-providers'
import type { NonFungibleTokenAPI } from '@masknet/web3-providers/types'
import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-solana'
import { SourceType } from '@masknet/web3-shared-base'
import { HubNonFungibleAPI_Base } from '../../Base/apis/HubNonFungibleAPI.js'
import type { HubOptions_Base } from '../../Base/apis/HubOptionsAPI.js'
import { SolanaHubOptionsAPI } from './HubOptionsAPI.js'

export class SolanaHubNonFungibleAPI extends HubNonFungibleAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
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
