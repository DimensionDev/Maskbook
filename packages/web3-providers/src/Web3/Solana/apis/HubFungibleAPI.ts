import { attemptUntil, SourceType } from '@masknet/web3-shared-base'
import {
    ChainId,
    type SchemaType,
    type ProviderType,
    type NetworkType,
    type MessageRequest,
    type MessageResponse,
    type Transaction,
    type TransactionParameter,
} from '@masknet/web3-shared-solana'
import { HubFungibleAPI_Base } from '../../Base/apis/HubFungibleAPI.js'
import { SolanaHubOptionsAPI } from './HubOptionsAPI.js'
import { SolanaConnectionAPI } from './ConnectionAPI.js'
import { SolanaWeb3StateRef } from './Web3StateAPI.js'
import type { HubOptions } from '../types/index.js'
import { CoinGeckoPriceAPI_Solana } from '../../../CoinGecko/index.js'
import { SolanaFungibleTokenAPI } from './FungibleTokenAPI.js'
import type { FungibleTokenAPI, PriceAPI } from '../../../entry-types.js'

export class SolanaHubFungibleAPI extends HubFungibleAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
> {
    private CoinGeckoPriceSolana = new CoinGeckoPriceAPI_Solana()
    private SolanaFungible = new SolanaFungibleTokenAPI()
    private Web3 = new SolanaConnectionAPI()

    protected override HubOptions = new SolanaHubOptionsAPI(this.options)

    protected override getProviders(initial?: HubOptions) {
        const options = this.HubOptions.fill(initial)

        // only the first page is available
        if ((options.indicator?.index ?? 0) > 0) return []

        return this.getPredicateProviders<FungibleTokenAPI.Provider<ChainId, SchemaType> | PriceAPI.Provider<ChainId>>(
            {
                [SourceType.Solana]: this.SolanaFungible,
                [SourceType.CoinGecko]: this.CoinGeckoPriceSolana,
            },
            [this.SolanaFungible, this.CoinGeckoPriceSolana],
            initial,
        )
    }

    override getFungibleToken(address: string, initial?: HubOptions | undefined) {
        return attemptUntil(
            [
                () =>
                    SolanaWeb3StateRef.value.Token?.createFungibleToken?.(initial?.chainId ?? ChainId.Mainnet, address),
                () => this.Web3.getFungibleToken(address, initial),
            ],
            undefined,
        )
    }
}
