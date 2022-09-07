import { HubStateClient } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST } from '@masknet/shared-base'
import {
    CoinGecko,
    FungibleTokenAPI,
    MagicEden,
    NonFungibleTokenAPI,
    SolanaFungible,
    SolanaNonFungible,
} from '@masknet/web3-providers'
import {
    CurrencyType,
    FungibleAsset,
    FungibleToken,
    GasOptionType,
    HubOptions,
    isSameAddress,
    NonFungibleAsset,
    NonFungibleToken,
    NonFungibleCollection,
    Pageable,
    SourceType,
    Transaction,
    attemptUntil,
    createPageable,
    createIndicator,
} from '@masknet/web3-shared-base'
import { ChainId, GasOption, getCoinGeckoConstants, getTokenConstants, SchemaType } from '@masknet/web3-shared-solana'
import type { SolanaHub } from './types'

class Hub extends HubStateClient<ChainId> implements SolanaHub {
    private getFungibleProviders(initial?: HubOptions<ChainId>) {
        const options = this.getOptions(initial)

        // only the first page is available
        if ((options.indicator ?? 0) > 0) return []

        return this.getProviders<FungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.Solana]: SolanaFungible,
            },
            [SolanaFungible],
            initial,
        )
    }

    private getNonFungibleProviders(initial?: HubOptions<ChainId>) {
        const options = this.getOptions(initial)
        return this.getProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.MagicEden]: MagicEden,
                [SourceType.Solana]: SolanaNonFungible,
            },
            [MagicEden, SolanaNonFungible],
            initial,
        )
    }

    async getFungibleTokensFromTokenList(
        chainId: ChainId,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<FungibleToken<ChainId, SchemaType>>> {
        return SolanaFungible.getFungibleTokens(chainId, [])
    }
    async getNonFungibleTokensFromTokenList(
        chainId: ChainId,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<NonFungibleToken<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }
    getGasOptions(chainId: ChainId, initial?: HubOptions<ChainId>): Promise<Record<GasOptionType, GasOption>> {
        throw new Error('Method not implemented.')
    }
    getFungibleAsset(address: string, initial?: HubOptions<ChainId>): Promise<FungibleAsset<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    async getNonFungibleAsset(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId>,
    ): Promise<NonFungibleAsset<ChainId, SchemaType> | undefined> {
        const options = this.getOptions(initial)
        const providers = this.getNonFungibleProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAsset?.(address, tokenId, options)),
            undefined,
        )
    }
    async getFungibleAssets(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
            account,
        })
        const providers = this.getFungibleProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAssets(options.account, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }
    async getNonFungibleAssets(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
            account,
        })
        const providers = this.getNonFungibleProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAssets?.(options.account, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }
    getNonFungibleCollectionsByOwner(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
            account,
        })
        return MagicEden.getCollectionsByOwner(options.account, options)
    }
    getFungibleTokenPrice(chainId: ChainId, address: string, initial?: HubOptions<ChainId>): Promise<number> {
        const options = this.getOptions(initial)
        const { PLATFORM_ID = '', COIN_ID = '' } = getCoinGeckoConstants(options.chainId)
        const { SOL_ADDRESS } = getTokenConstants(options.chainId)

        if (isSameAddress(address, SOL_ADDRESS)) {
            return CoinGecko.getTokenPriceByCoinId(COIN_ID, options.currencyType)
        }

        return CoinGecko.getTokenPrice(PLATFORM_ID, address, options.currencyType)
    }
    getNonFungibleTokenPrice(
        chainId: ChainId,
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId>,
    ): Promise<never> {
        throw new Error('Method not implemented.')
    }
    async getFungibleTokenIconURLs(
        chainId: ChainId,
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<string[]> {
        return []
    }
    getNonFungibleTokenIconURLs(
        chainId: ChainId,
        address: string,
        tokenId?: string | undefined,
        initial?: HubOptions<ChainId>,
    ): Promise<string[]> {
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
    return new Hub(chainId, account, sourceType, currencyType)
}
