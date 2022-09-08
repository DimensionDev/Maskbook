import { EMPTY_LIST, PartialRequired } from '@masknet/shared-base'
import {
    AlchemyEVM,
    CoinGecko,
    DeBank,
    EthereumWeb3,
    MetaSwap,
    AstarGas,
    NFTScanNonFungibleTokenEVM,
    OpenSea,
    Rarible,
    TokenList,
    Zerion,
    Rabby,
    NonFungibleTokenAPI,
    FungibleTokenAPI,
    LooksRare,
    Gem,
    Zora,
    ChainbaseNonFungibleToken,
} from '@masknet/web3-providers'
import {
    FungibleToken,
    NonFungibleToken,
    NonFungibleCollection,
    SourceType,
    FungibleAsset,
    HubOptions,
    NonFungibleAsset,
    Pageable,
    createPageable,
    currySameAddress,
    CurrencyType,
    Transaction,
    attemptUntil,
    createPredicate,
    createIndicator,
    FungibleTokenSecurity,
    FungibleTokenSpenderAuthorization,
    NonFungibleContractSpenderAuthorization,
    HubIndicator,
    NonFungibleTokenEvent,
    NonFungibleTokenOrder,
    OrderSide,
    NonFungibleTokenContract,
    NonFungibleTokenRarity,
} from '@masknet/web3-shared-base'
import {
    ChainId,
    chainResolver,
    formatEthereumAddress,
    getCoinGeckoConstants,
    getTokenAssetBaseURLConstants,
    getTokenListConstants,
    SchemaType,
    isNativeTokenAddress,
} from '@masknet/web3-shared-evm'
import SPECIAL_ICON_LIST from './TokenIconSpecialIconList.json'
import type { EVM_Hub } from './types'

class Hub implements EVM_Hub {
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

    private getProviders<T extends unknown>(
        providers: Partial<Record<SourceType, T>>,
        defaultProviders: T[],
        initial?: HubOptions<ChainId>,
    ) {
        const options = this.getOptions(initial)
        const predicate = createPredicate(Object.keys(providers) as Array<keyof typeof providers>)
        return predicate(options.sourceType) ? [providers[options.sourceType]!] : defaultProviders
    }

    private getFungibleProviders(initial?: HubOptions<ChainId>) {
        const options = this.getOptions(initial)

        // only the first page is available
        if ((options.indicator ?? 0) > 0) return []

        return this.getProviders<FungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.DeBank]: DeBank,
                [SourceType.Zerion]: Zerion,
            },
            [DeBank, Zerion],
            initial,
        )
    }

    private getNonFungibleProviders(initial?: HubOptions<ChainId>) {
        const options = this.getOptions(initial)
        return this.getProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.NFTScan]: NFTScanNonFungibleTokenEVM,
                [SourceType.Rarible]: Rarible,
                [SourceType.OpenSea]: OpenSea,
                [SourceType.Alchemy_EVM]: AlchemyEVM,
                [SourceType.LooksRare]: LooksRare,
                [SourceType.Zora]: Zora,
            },
            options.chainId === ChainId.Mainnet
                ? [NFTScanNonFungibleTokenEVM, Rarible, OpenSea, AlchemyEVM, LooksRare, Zora]
                : [NFTScanNonFungibleTokenEVM, Rarible, AlchemyEVM, OpenSea, LooksRare, Zora],
            initial,
        )
    }

    async getGasOptions(chainId: ChainId, initial?: HubOptions<ChainId>) {
        const options = this.getOptions(initial, {
            chainId,
        })
        try {
            const isEIP1559 = chainResolver.isSupport(options.chainId, 'EIP1559')
            if (isEIP1559 && chainId !== ChainId.Astar) return await MetaSwap.getGasOptions(options.chainId)
            if (chainId === ChainId.Astar) return await AstarGas.getGasOptions(options.chainId)
            return await DeBank.getGasOptions(options.chainId)
        } catch (error) {
            return EthereumWeb3.getGasOptions(options.chainId)
        }
    }

    async getTransactions(
        chainId: ChainId,
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
            account,
            chainId,
        })
        return DeBank.getTransactions(options.account, options)
    }

    async getNonFungibleTokensByCollection(
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleToken<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleAssetsByCollection(
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        return NFTScanNonFungibleTokenEVM.getAssetsByCollection(address, initial)
    }

    async getNonFungibleTokenContract(
        address: string,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType> | undefined> {
        return NFTScanNonFungibleTokenEVM.getContract(address, initial)
    }

    async getFungibleTokenBalance(
        address: string,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<number> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleTokenBalance(
        address: string,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<number> {
        throw new Error('Method not implemented.')
    }

    async getFungibleTokenSecurity(
        chainId: ChainId,
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<FungibleTokenSecurity> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleTokenSecurity(
        chainId: ChainId,
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<FungibleTokenSecurity> {
        throw new Error('Method not implemented.')
    }

    async getFungibleTokensFromTokenList(
        chainId: ChainId,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<FungibleToken<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
            chainId,
        })
        const { FUNGIBLE_TOKEN_LISTS = EMPTY_LIST } = getTokenListConstants(options.chainId)
        return TokenList.getFungibleTokens(options.chainId, FUNGIBLE_TOKEN_LISTS)
    }

    async getNonFungibleTokensFromTokenList(
        chainId: ChainId,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<NonFungibleToken<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }

    async getFungibleTokenIconURLs(
        chainId: ChainId,
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<string[]> {
        const options = this.getOptions(initial, {
            chainId,
        })
        const { NATIVE_TOKEN_ASSET_BASE_URI = EMPTY_LIST, ERC20_TOKEN_ASSET_BASE_URI = EMPTY_LIST } =
            getTokenAssetBaseURLConstants(options.chainId)
        const formattedAddress = formatEthereumAddress(address)

        if (isNativeTokenAddress(formattedAddress)) {
            return NATIVE_TOKEN_ASSET_BASE_URI?.map((x) => `${x}/info/logo.png/public`)
        }

        const specialIcon = SPECIAL_ICON_LIST.find(currySameAddress(address))
        if (specialIcon) return [specialIcon.logo_url]

        // load from remote
        return ERC20_TOKEN_ASSET_BASE_URI.map((x) => `${x}/${formattedAddress}/logo.png/quality=85`)
    }

    async getNonFungibleTokenIconURLs(
        chainId: ChainId,
        address: string,
        tokenId?: string | undefined,
        initial?: HubOptions<ChainId>,
    ): Promise<string[]> {
        throw new Error('Method not implemented.')
    }

    async getFungibleTokenPrice(chainId: ChainId, address: string, initial?: HubOptions<ChainId>): Promise<number> {
        const options = this.getOptions(initial, {
            chainId,
        })
        const { PLATFORM_ID = '', COIN_ID = '' } = getCoinGeckoConstants(options.chainId)

        if (isNativeTokenAddress(address)) {
            return CoinGecko.getTokenPriceByCoinId(COIN_ID, options.currencyType)
        }
        return CoinGecko.getTokenPrice(PLATFORM_ID, address, options.currencyType)
    }

    async getNonFungibleTokenPrice(
        chainId: ChainId,
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId>,
    ): Promise<never> {
        throw new Error('Method not implemented.')
    }

    async getApprovedFungibleTokenSpenders(
        chainId: ChainId,
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<FungibleTokenSpenderAuthorization<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
            chainId,
            account,
        })
        return Rabby.getApprovedFungibleTokenSpenders(options.chainId, options.account)
    }
    async getApprovedNonFungibleContracts(
        chainId: ChainId,
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<NonFungibleContractSpenderAuthorization<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
            chainId,
            account,
        })
        return Rabby.getApprovedNonFungibleContracts(options.chainId, options.account)
    }

    async getFungibleAsset(
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<FungibleAsset<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
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

    async getNonFungibleRarity(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId>,
    ): Promise<NonFungibleTokenRarity<ChainId> | undefined> {
        const options = this.getOptions(initial)
        const providers = this.getProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.Gem]: Gem,
            },
            [Gem],
            initial,
        )
        return attemptUntil(
            providers.map((x) => () => x.getRarity?.(address, tokenId, options)),
            undefined,
        )
    }
    async getNonFungibleAssets(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getNonFungibleProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAssets?.(options.account, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getFungibleToken(
        address: string,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<FungibleToken<ChainId, SchemaType> | undefined> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleToken(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId>,
    ): Promise<NonFungibleToken<ChainId, SchemaType> | undefined> {
        const options = this.getOptions(initial)
        const providers = this.getNonFungibleProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getToken?.(address, tokenId, options)),
            undefined,
        )
    }

    async getFungibleTokens(
        account: string,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<Pageable<Error | FungibleToken<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleTokens(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleToken<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleTokenEvents(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<Pageable<NonFungibleTokenEvent<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getNonFungibleProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getEvents?.(address, tokenId, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleTokenListings(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getNonFungibleProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getListings?.(address, tokenId, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleTokenOffers(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getNonFungibleProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getOffers?.(address, tokenId, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleTokenOrders(
        address: string,
        tokenId: string,
        side: OrderSide,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getNonFungibleProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getOrders?.(address, tokenId, side, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleCollectionsByOwner(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.NFTScan]: NFTScanNonFungibleTokenEVM,
                [SourceType.OpenSea]: OpenSea,
            },
            [NFTScanNonFungibleTokenEVM, OpenSea],
            initial,
        )

        return attemptUntil(
            providers.map((x) => () => x.getCollectionsByOwner?.(account, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleCollectionsByKeyword(
        keyword: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.NFTScan]: NFTScanNonFungibleTokenEVM,
                [SourceType.Chainbase]: ChainbaseNonFungibleToken,
                [SourceType.Zora]: Zora,
            },
            [NFTScanNonFungibleTokenEVM, ChainbaseNonFungibleToken, Zora],
            initial,
        )

        return attemptUntil(
            providers.map((x) => () => x.getCollectionsByKeyword?.(keyword, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
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
