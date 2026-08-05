import { attemptUntil, SourceType } from '@masknet/web3-shared-base'
import type { AuthorizationAPI, TokenIconAPI, TokenListAPI, FungibleTokenAPI, PriceAPI  } from '../../../entry-types.js'
import { ChainId, type SchemaType } from '@masknet/web3-shared-solana'
import { BaseHubFungible } from '../../Base/apis/HubFungible.js'
import { SolanaHubOptionsAPI } from './HubOptionsAPI.js'
import { SolanaConnectionAPI } from './ConnectionAPI.js'
import type { SolanaHubOptions } from '../types/index.js'
import defer * as CoinGeckoPriceSolana from '../../../CoinGecko/index.js'
import { SolanaFungible } from './FungibleTokenAPI.js'
import { solana } from '../../../Manager/registry.js'

export class SolanaHubFungibleAPI extends BaseHubFungible<ChainId, SchemaType> {
    private Web3 = new SolanaConnectionAPI()

    protected override HubOptions = new SolanaHubOptionsAPI(this.options)

    protected override getProvidersFungible(
        initial?: SolanaHubOptions,
    ): Array<
        AuthorizationAPI.Provider<ChainId> &
            FungibleTokenAPI.Provider<ChainId, SchemaType> &
            TokenListAPI.Provider<ChainId, SchemaType> &
            TokenIconAPI.Provider<ChainId> &
            PriceAPI.Provider<ChainId>
    > {
        const options = this.HubOptions.fill(initial)

        // only the first page is available
        if ((options.indicator?.index ?? 0) > 0) return []

        return this.getPredicateProviders<FungibleTokenAPI.Provider<ChainId, SchemaType> | PriceAPI.Provider<ChainId>>(
            {
                [SourceType.Solana]: SolanaFungible,
                [SourceType.CoinGecko]: CoinGeckoPriceSolana.CoinGeckoPriceSolana,
            },
            [SolanaFungible, CoinGeckoPriceSolana.CoinGeckoPriceSolana],
            initial,
        )
    }

    override getFungibleToken(address: string, initial?: SolanaHubOptions) {
        return attemptUntil(
            [
                () => solana.state?.Token?.createFungibleToken?.(initial?.chainId ?? ChainId.Mainnet, address),
                () => this.Web3.getFungibleToken(address, initial),
            ],
            undefined,
        )
    }
}
