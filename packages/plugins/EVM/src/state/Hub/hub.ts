import {
    Alchemy_EVM,
    CoinGecko,
    DeBank,
    EthereumWeb3,
    MetaSwap,
    OpenSea,
    Rarible,
    TokenList,
    Zerion,
} from '@masknet/web3-providers'
import {
    FungibleToken,
    NonFungibleToken,
    NonFungibleTokenCollection,
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
    attemptUntil,
    createPredicate,
    createIndicator,
} from '@masknet/web3-shared-base'
import {
    ChainId,
    chainResolver,
    formatEthereumAddress,
    GasOption,
    getCoinGeckoConstants,
    getTokenAssetBaseURLConstants,
    getTokenConstants,
    getTokenListConstants,
    SchemaType,
    isNativeTokenAddress,
} from '@masknet/web3-shared-evm'
import SPECIAL_ICON_LIST from './TokenIconSpecialIconList.json'
import type { EVM_Hub } from './types'

class Hub implements EVM_Hub {
    constructor(
        private chainId?: ChainId,
        private account?: string,
        private sourceType?: SourceType,
        private currencyType?: CurrencyType,
    ) {}

    async getFungibleTokensFromTokenList(
        chainId: ChainId,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Array<FungibleToken<ChainId, SchemaType>>> {
        const expectedChainId = options?.chainId ?? chainId
        const { FUNGIBLE_TOKEN_LISTS = [] } = getTokenListConstants(expectedChainId)
        return TokenList.fetchFungibleTokensFromTokenLists(expectedChainId, FUNGIBLE_TOKEN_LISTS)
    }
    async getNonFungibleTokensFromTokenList(
        chainId: ChainId,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Array<NonFungibleToken<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }
    async getGasOptions(
        chainId: ChainId,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Record<GasOptionType, GasOption>> {
        const expectedChainId = options?.chainId ?? chainId

        try {
            const isEIP1559 = chainResolver.isSupport(expectedChainId, 'EIP1559')
            if (isEIP1559) return await MetaSwap.getGasOptions(expectedChainId)
            return await DeBank.getGasOptions(expectedChainId)
        } catch (error) {
            return EthereumWeb3.getGasOptions(expectedChainId)
        }
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
        const { indicator, sourceType } = options ?? {}

        // only the first page is available
        if ((indicator ?? 0) > 0) return createPageable([], createIndicator(options?.indicator))

        const providers = {
            [SourceType.DeBank]: DeBank,
            [SourceType.Zerion]: Zerion,
        }
        const predicate = createPredicate(Object.keys(providers) as Array<keyof typeof providers>)
        const filteredProviders = predicate(sourceType) ? [providers[sourceType]] : [DeBank, Zerion]
        return attemptUntil(
            filteredProviders.map((x) => () => x.getAssets(account, { chainId: this.chainId, ...options })),
            createPageable([], createIndicator(options?.indicator)),
        )
    }
    async getNonFungibleAsset(
        address: string,
        tokenId: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<NonFungibleAsset<ChainId, SchemaType> | undefined> {
        const { sourceType } = options ?? {}
        const providers = {
            [SourceType.OpenSea]: OpenSea,
            [SourceType.Rarible]: Rarible,
            [SourceType.Alchemy_EVM]: Alchemy_EVM,
        }
        const predicate = createPredicate(Object.keys(providers) as Array<keyof typeof providers>)
        const filteredProviders = predicate(sourceType) ? [providers[sourceType]] : [Alchemy_EVM, OpenSea, Rarible]
        return attemptUntil(
            filteredProviders.map((x) => () => x.getAsset(address, tokenId, options)),
            undefined,
        )
    }
    async getNonFungibleTokens(
        account: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        const { sourceType } = options ?? {}
        const providers = {
            [SourceType.OpenSea]: OpenSea,
            [SourceType.Rarible]: Rarible,
            [SourceType.Alchemy_EVM]: Alchemy_EVM,
        }
        const predicate = createPredicate(Object.keys(providers) as Array<keyof typeof providers>)
        const filteredProviders = predicate(sourceType) ? [providers[sourceType]] : [Alchemy_EVM, OpenSea, Rarible]
        return attemptUntil(
            filteredProviders.map((x) => () => x.getAssets(account, { chainId: this.chainId, ...options })),
            createPageable([], createIndicator(options?.indicator)),
        )
    }
    getNonFungibleCollections(
        account: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Pageable<NonFungibleTokenCollection<ChainId>>> {
        return OpenSea.getCollections(account, options)
    }
    getFungibleTokenPrice(
        chainId: ChainId,
        address: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<number> {
        const expectedChainId = options?.chainId ?? chainId
        const expectedCurrencyType = options?.currencyType ?? this.currencyType
        const { PLATFORM_ID = '', COIN_ID = '' } = getCoinGeckoConstants(expectedChainId)

        if (isNativeTokenAddress(address)) {
            return CoinGecko.getTokenPriceByCoinId(COIN_ID, expectedCurrencyType)
        }

        return CoinGecko.getTokenPrice(PLATFORM_ID, address, expectedCurrencyType)
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
        const expectedChainId = options?.chainId ?? chainId
        const { TOKEN_ASSET_BASE_URI = [] } = getTokenAssetBaseURLConstants(expectedChainId)
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
    ): Promise<Array<Transaction<ChainId, SchemaType>>> {
        const expectedChainId = options?.chainId ?? chainId
        return DeBank.getTransactions(account, { chainId: expectedChainId })
    }
}

export function createHub(chainId?: ChainId, account?: string, sourceType?: SourceType, currencyType?: CurrencyType) {
    return new Hub(chainId, account, sourceType, currencyType)
}
