import { MagicEden, BitcoinNonFungible, NFTScanNonFungibleTokenBitcoin } from '@masknet/web3-providers'
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
} from '@masknet/web3-shared-bitcoin'
import { SourceType } from '@masknet/web3-shared-base'
import { HubNonFungibleAPI_Base } from '../../Base/apis/HubNonFungibleAPI.js'
import type { HubOptions_Base } from '../../Base/apis/HubOptionsAPI.js'
import { BitcoinHubOptionsAPI } from './HubOptionsAPI.js'

export class BitcoinHubNonFungibleAPI extends HubNonFungibleAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
    Transaction,
    TransactionParameter
> {
    protected override HubOptions = new BitcoinHubOptionsAPI(this.options)

    protected override getProviders(initial?: HubOptions_Base<ChainId>) {
        return this.getPredicateProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.MagicEden]: MagicEden,
                [SourceType.Bitcoin]: BitcoinNonFungible,
                [SourceType.NFTScan]: NFTScanNonFungibleTokenBitcoin,
                [SourceType.SimpleHash]: SimpleHashBitcoin,
            },
            [NFTScanNonFungibleTokenBitcoin, MagicEden, BitcoinNonFungible],
            initial,
        )
    }
}
