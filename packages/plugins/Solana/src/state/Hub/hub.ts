import type { PartialRequired } from '@masknet/shared-base'
import { CoinGecko, MagicEden } from '@masknet/web3-providers'
import {
    CurrencyType,
    FungibleAsset,
    FungibleToken,
    GasOptionType,
    HubOptions,
    isSameAddress,
    NonFungibleAsset,
    NonFungibleToken,
    NonFungibleTokenCollection,
    Pageable,
    SourceType,
    Transaction,
} from '@masknet/web3-shared-base'
import { ChainId, GasOption, getCoinGeckoConstants, getTokenConstants, SchemaType } from '@masknet/web3-shared-solana'
import { SolanaRPC } from '../../messages'
import type { SolanaHub } from './types'

class Hub implements SolanaHub {
    constructor(
        private chainId: ChainId,
        private account: string,
        private sourceType?: SourceType,
        private currencyType?: CurrencyType,
    ) {}

    private getOptions(
        initial?: HubOptions<ChainId>,
        overrides?: Partial<HubOptions<ChainId>>,
    ): PartialRequired<HubOptions<ChainId>, 'chainId' | 'account'> {
        return {
            chainId: this.chainId,
            account: this.account,
            sourceType: this.sourceType,
            currencyType: this.currencyType,
            ...initial,
            ...overrides,
        }
    }

    async getFungibleTokensFromTokenList(
        chainId: ChainId,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<FungibleToken<ChainId, SchemaType>>> {
        return SolanaRPC.getAllSplTokens()
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
        return MagicEden.getAsset(address, tokenId, options)
    }
    async getFungibleAssets(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        return SolanaRPC.getFungibleAssets(account, options)
    }
    getNonFungibleTokens(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        try {
            return MagicEden.getTokens(account, options)
        } catch {
            return SolanaRPC.getNonFungibleAssets(account, options)
        }
    }
    getNonFungibleCollections(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleTokenCollection<ChainId>>> {
        const options = this.getOptions(initial, {
            account,
        })
        return MagicEden.getCollections(account, options)
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
    ): Promise<Array<Transaction<ChainId, SchemaType>>> {
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
