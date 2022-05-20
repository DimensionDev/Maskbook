import { CoinGecko, DeBank, MetaSwap, NFTScan, OpenSea, TokenList, Zerion } from '@masknet/web3-providers'
import {
    FungibleToken,
    NonFungibleToken,
    SourceType,
    FungibleAsset,
    HubOptions,
    NonFungibleAsset,
    Pageable,
    GasOptionType,
    createPageable,
    isSameAddress,
    currySameAddress,
    CurrencyType,
    Transaction,
} from '@masknet/web3-shared-base'
import {
    ChainId,
    chainResolver,
    formatEthereumAddress,
    GasOption,
    getTokenAssetBaseURLConstants,
    getTokenConstants,
    getTokenListConstants,
    SchemaType,
} from '@masknet/web3-shared-evm'
import SPECIAL_ICON_LIST from './TokenIconSpecialIconList.json'
import type { EVM_Hub } from './types'

class Hub implements EVM_Hub {
    constructor(
        private chainId?: ChainId,
        private account?: string,
        private sourceType?: SourceType,
        private currencyType?: CurrencyType,
        private sizePerPage = 50,
        private maxPageSize = 25,
    ) {}

    async getFungibleTokensFromTokenList(
        chainId: ChainId,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<FungibleToken<ChainId, SchemaType>[]> {
        const { FUNGIBLE_TOKEN_LISTS = [] } = getTokenListConstants(chainId)
        return TokenList.fetchFungibleTokensFromTokenLists(chainId, FUNGIBLE_TOKEN_LISTS)
    }
    async getNonFungibleTokensFromTokenList(
        chainId: ChainId,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<NonFungibleToken<ChainId, SchemaType>[]> {
        throw new Error('Method not implemented.')
    }
    getGasOptions(
        chainId: ChainId,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Record<GasOptionType, GasOption>> {
        if (chainResolver.isSupport(chainId, 'EIP1559')) {
            return MetaSwap.getGasOptions(chainId)
        }
        return DeBank.getGasOptions(chainId)
    }
    getFungibleAsset(
        address: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<FungibleAsset<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    async getFungibleAssets(
        account: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>>> {
        // only the first page is available
        if ((options?.page ?? 0) > 0) return createPageable([])
        try {
            return DeBank.getAssets(account, options)
        } catch {
            return Zerion.getAssets(account, options)
        }
    }
    async getNonFungibleAsset(
        address: string,
        tokenId: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<NonFungibleAsset<ChainId, SchemaType> | undefined> {
        return OpenSea.getAsset(address, tokenId, options)
    }
    getNonFungibleAssets(
        account: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        try {
            return OpenSea.getTokens(account, options)
        } catch {
            return NFTScan.getTokens(account, options)
        }
    }
    getFungibleTokenPrice(
        chainId: ChainId,
        address: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<number> {
        return CoinGecko.getTokenPrice(address, options?.currencyType ?? this.currencyType)
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
        const { TOKEN_ASSET_BASE_URI = [] } = getTokenAssetBaseURLConstants(chainId)
        const checkSummedAddress = formatEthereumAddress(address)

        if (isSameAddress(getTokenConstants().NATIVE_TOKEN_ADDRESS, checkSummedAddress)) {
            return TOKEN_ASSET_BASE_URI.map((x) => `${x}/info/logo.png`)
        }

        const specialIcon = SPECIAL_ICON_LIST.find(currySameAddress(address))
        if (specialIcon) return [specialIcon.logo_url]

        // load from remote
        return TOKEN_ASSET_BASE_URI.map((x) => `${x}/assets/${checkSummedAddress}/logo.png`)
    }
    getNonFungibleTokenIconURLs(
        chainId: ChainId,
        address: string,
        tokenId?: string | undefined,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<string[]> {
        throw new Error('Method not implemented.')
    }
    async getTransactions(
        chainId: ChainId,
        account: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        return DeBank.getTransactions(account, { chainId })
    }

    async *getAllFungibleAssets(address: string): AsyncIterableIterator<FungibleAsset<ChainId, SchemaType>> {
        for (let i = 0; i < this.maxPageSize; i += 1) {
            const pageable = await this.getFungibleAssets(address, {
                page: i,
                size: this.sizePerPage,
            })

            yield* pageable.data

            if (pageable.data.length === 0) return
        }
    }

    async *getAllNonFungibleAssets(address: string): AsyncIterableIterator<NonFungibleAsset<ChainId, SchemaType>> {
        for (let i = 0; i < this.maxPageSize; i += 1) {
            const pageable = await this.getNonFungibleAssets(address, {
                page: i,
                size: this.sizePerPage,
            })

            yield* pageable.data

            if (pageable.data.length === 0) return
        }
    }
}

export function createHub(
    chainId?: ChainId,
    account?: string,
    sourceType?: SourceType,
    currencyType?: CurrencyType,
    sizePerPage?: number,
    maxPageSize?: number,
) {
    return new Hub(chainId, account, sourceType, currencyType, sizePerPage, maxPageSize)
}
