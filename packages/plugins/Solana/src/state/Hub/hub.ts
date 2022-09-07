import { assignIn } from 'lodash-unified'
import { HubStateClient, HubStateFungibleClient, HubStateNonFungibleClient } from '@masknet/plugin-infra/web3'
import {
    CoinGecko,
    MagicEden,
    FungibleTokenAPI,
    NonFungibleTokenAPI,
    SolanaFungible,
    SolanaNonFungible,
} from '@masknet/web3-providers'
import {
    CurrencyType,
    GasOptionType,
    HubOptions,
    isSameAddress,
    Pageable,
    SourceType,
    Transaction,
} from '@masknet/web3-shared-base'
import { ChainId, GasOption, getCoinGeckoConstants, getTokenConstants, SchemaType } from '@masknet/web3-shared-solana'
import type { SolanaHub } from './types'

class HubFungibleClient extends HubStateFungibleClient<ChainId, SchemaType> {
    protected getFungibleProviders(initial?: HubOptions<ChainId>) {
        const options = this.getOptions(initial)

        // only the first page is available
        if ((options.indicator ?? 0) > 0) return []

        return this.getPredicateProviders<FungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.Solana]: SolanaFungible,
            },
            [SolanaFungible],
            initial,
        )
    }

    override async getFungibleTokenPrice(
        chainId: ChainId,
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<number> {
        const options = this.getOptions(initial)
        const { PLATFORM_ID = '', COIN_ID = '' } = getCoinGeckoConstants(options.chainId)
        const { SOL_ADDRESS } = getTokenConstants(options.chainId)

        if (isSameAddress(address, SOL_ADDRESS)) {
            return CoinGecko.getTokenPriceByCoinId(COIN_ID, options.currencyType)
        }

        return CoinGecko.getTokenPrice(PLATFORM_ID, address, options.currencyType)
    }
}

class HubNonFungibleClient extends HubStateNonFungibleClient<ChainId, SchemaType> {
    protected override getProviders(initial?: HubOptions<ChainId>) {
        const options = this.getOptions(initial)
        return this.getPredicateProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.MagicEden]: MagicEden,
                [SourceType.Solana]: SolanaNonFungible,
            },
            [MagicEden, SolanaNonFungible],
            initial,
        )
    }
}

class Hub extends HubStateClient<ChainId> implements SolanaHub {
    getGasOptions(chainId: ChainId, initial?: HubOptions<ChainId>): Promise<Record<GasOptionType, GasOption>> {
        throw new Error('Method not implemented.')
    }

    getTransactions(
        chainId: ChainId,
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }
}

export function createHub(
    chainId = ChainId.Mainnet,
    account = '',
    sourceType?: SourceType,
    currencyType?: CurrencyType,
) {
    return assignIn(
        new Hub(chainId, account, sourceType, currencyType),
        new HubFungibleClient(chainId, account, sourceType, currencyType),
        new HubNonFungibleClient(chainId, account, sourceType, currencyType),
    )
}
