import { MagicEden } from '@masknet/web3-providers'
import {
    FungibleToken,
    NonFungibleToken,
    SourceType,
    FungibleAsset,
    HubOptions,
    NonFungibleAsset,
    Pageable,
    GasOptionType,
    CurrencyType,
    Transaction,
    NonFungibleTokenCollection,
    TokenType,
} from '@masknet/web3-shared-base'
import { ChainId, GasOption, SchemaType } from '@masknet/web3-shared-solana'
import { SolanaRPC } from '../../messages'
import type { SolanaHub } from './types'

class Hub implements SolanaHub {
    constructor(
        private chainId: ChainId,
        private account: string,
        private sourceType?: SourceType,
        private currencyType?: CurrencyType,
        private sizePerPage = 50,
        private maxPageSize = 25,
    ) {}

    async getFungibleTokensFromTokenList(
        chainId: ChainId,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Array<FungibleToken<ChainId, SchemaType>>> {
        const splTokens = await SolanaRPC.getAllSplTokens(chainId)
        const fungibleTokens = splTokens.map((token) => ({
            id: token.address,
            chainId,
            type: TokenType.Fungible,
            schema: SchemaType.Fungible,
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            logoURL: token.logoURI,
        }))
        return fungibleTokens
    }
    async getNonFungibleTokensFromTokenList(
        chainId: ChainId,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Array<NonFungibleToken<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }
    getGasOptions(
        chainId: ChainId,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Record<GasOptionType, GasOption>> {
        throw new Error('Method not implemented.')
    }
    getFungibleAsset(
        address: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<FungibleAsset<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    async getNonFungibleAsset(
        address: string,
        tokenId: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<NonFungibleAsset<ChainId, SchemaType> | undefined> {
        return MagicEden.getAsset(address, tokenId, options)
    }
    async getFungibleAssets(
        account: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>>> {
        return SolanaRPC.getFungibleAssets(account, options)
    }
    getNonFungibleAssets(
        account: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        try {
            return SolanaRPC.getNonFungibleAssets(account, options)
        } catch {
            return MagicEden.getTokens(account, options)
        }
    }
    getNonFungibleCollections(
        account: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Pageable<NonFungibleTokenCollection<ChainId>>> {
        return MagicEden.getCollections(account, options)
    }
    getFungibleTokenPrice(
        chainId: ChainId,
        address: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<number> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenPrice(
        chainId: ChainId,
        address: string,
        tokenId: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<never> {
        throw new Error('Method not implemented.')
    }
    async getFungibleTokenIconURLs(
        chainId: ChainId,
        address: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<string[]> {
        return []
    }
    getNonFungibleTokenIconURLs(
        chainId: ChainId,
        address: string,
        tokenId?: string | undefined,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<string[]> {
        throw new Error('Method not implemented.')
    }
    getTransactions(
        chainId: ChainId,
        account: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }

    async *getAllFungibleAssets(address: string): AsyncIterableIterator<FungibleAsset<ChainId, SchemaType>> {
        for (let i = 0; i < this.maxPageSize; i += 1) {
            const pageable = await this.getFungibleAssets(address, {
                indicator: i,
                size: this.sizePerPage,
            })

            yield* pageable.data

            if (pageable.data.length === 0) return
        }
    }

    async *getAllNonFungibleAssets(address: string): AsyncIterableIterator<NonFungibleAsset<ChainId, SchemaType>> {
        for (let i = 0; i < this.maxPageSize; i += 1) {
            const pageable = await this.getNonFungibleAssets(address, {
                indicator: i,
                size: this.sizePerPage,
            })

            yield* pageable.data

            if (pageable.data.length === 0) return
        }
    }
}

export function createHub(
    chainId = ChainId.Mainnet,
    account = '',
    sourceType?: SourceType,
    currencyType?: CurrencyType,
    sizePerPage?: number,
    maxPageSize?: number,
) {
    return new Hub(chainId, account, sourceType, currencyType, sizePerPage, maxPageSize)
}
