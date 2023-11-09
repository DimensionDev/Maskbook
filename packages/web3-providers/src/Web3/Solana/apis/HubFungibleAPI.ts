import { attemptUntil, SourceType } from '@masknet/web3-shared-base'
import { ChainId, type SchemaType } from '@masknet/web3-shared-solana'
import { BaseHubFungible } from '../../Base/apis/HubFungibleAPI.js'
import { SolanaHubOptionsAPI } from './HubOptionsAPI.js'
import { SolanaConnectionAPI } from './ConnectionAPI.js'
import type { SolanaHubOptions } from '../types/index.js'
import { CoinGeckoPriceSolana } from '../../../CoinGecko/index.js'
import { SolanaFungible } from './FungibleTokenAPI.js'
import type { FungibleTokenAPI, PriceAPI } from '../../../entry-types.js'
import { solana } from '../../../Manager/registry.js'

export class SolanaHubFungibleAPI extends BaseHubFungible<ChainId, SchemaType> {
    private Web3 = new SolanaConnectionAPI()

    protected override HubOptions = new SolanaHubOptionsAPI(this.options)

    protected override getProvidersFungible(initial?: SolanaHubOptions) {
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

    override getFungibleToken(address: string, initial?: SolanaHubOptions | undefined) {
        return attemptUntil(
            [
                () => solana.state?.Token?.createFungibleToken?.(initial?.chainId ?? ChainId.Mainnet, address),
                () => this.Web3.getFungibleToken(address, initial),
            ],
            undefined,
        )
    }
}
