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

const CoinGeckoPriceSolana = new CoinGeckoPriceAPI_Solana()
const SolanaFungible = new SolanaFungibleTokenAPI()
const Web3 = new SolanaConnectionAPI()

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
    protected override HubOptions = new SolanaHubOptionsAPI(this.options)

    protected override getProviders(initial?: HubOptions) {
        const options = this.HubOptions.fill(initial)

        // only the first page is available
        if ((options.indicator?.index ?? 0) > 0) return []

        return this.getPredicateProviders<FungibleTokenAPI.Provider<ChainId, SchemaType> | PriceAPI.Provider<ChainId>>(
            {
                [SourceType.Solana]: SolanaFungible,
                [SourceType.CoinGecko]: CoinGeckoPriceSolana,
            },
            [SolanaFungible, CoinGeckoPriceSolana],
            initial,
        )
    }

    override getFungibleToken(address: string, initial?: HubOptions | undefined) {
        return attemptUntil(
            [
                () =>
                    SolanaWeb3StateRef.value.Token?.createFungibleToken?.(initial?.chainId ?? ChainId.Mainnet, address),
                () => Web3.getFungibleToken(address, initial),
            ],
            undefined,
        )
    }
}
