import { EMPTY_LIST, PartialRequired } from '@masknet/shared-base'
import {
    Alchemy_EVM,
    CoinGecko,
    DeBank,
    EthereumWeb3,
    MetaSwap,
    NFTScan,
    OpenSea,
    Rarible,
    TokenList,
    Zerion,
    Rabby,
    NonFungibleTokenAPI,
    FungibleTokenAPI,
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
    createPageable,
    isSameAddress,
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
} from '@masknet/web3-shared-base'
import {
    ChainId,
    chainResolver,
    formatEthereumAddress,
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

    async getGasOptions(chainId: ChainId, initial?: HubOptions<ChainId>) {
        const options = this.getOptions(initial, {
            chainId,
        })
        try {
            const isEIP1559 = chainResolver.isSupport(options.chainId, 'EIP1559')
            if (isEIP1559) return await MetaSwap.getGasOptions(options.chainId)
            return await DeBank.getGasOptions(options.chainId)
        } catch (error) {
            return EthereumWeb3.getGasOptions(options.chainId)
        }
    }

    async getTransactions(
        chainId: ChainId,
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<Transaction<ChainId, SchemaType>>> {
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
        return NFTScan.getAssetsByCollection(address, initial)
    }

    async getNonFungibleTokenContract(
        address: string,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
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
        const options = this.getOptions(initial, {
            chainId,
        })
        throw new Error('Method not implemented.')
    }
    async getNonFungibleTokenSecurity(
        chainId: ChainId,
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<FungibleTokenSecurity> {
        const options = this.getOptions(initial, {
            chainId,
        })
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
        return TokenList.fetchFungibleTokensFromTokenLists(options.chainId, FUNGIBLE_TOKEN_LISTS)
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
        const { TOKEN_ASSET_BASE_URI = EMPTY_LIST } = getTokenAssetBaseURLConstants(options.chainId)
        const checkSummedAddress = formatEthereumAddress(address)

        if (isSameAddress(getTokenConstants(options.chainId).NATIVE_TOKEN_ADDRESS, checkSummedAddress)) {
            return TOKEN_ASSET_BASE_URI.map((x) => `${x}/info/logo.png`)
        }

        const specialIcon = SPECIAL_ICON_LIST.find(currySameAddress(address))
        if (specialIcon) return [specialIcon.logo_url]

        // load from remote
        return TOKEN_ASSET_BASE_URI.map((x) => `${x}/assets/${checkSummedAddress}/logo.png`)
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
    async getNonFungibleAsset(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId>,
    ): Promise<NonFungibleAsset<ChainId, SchemaType> | undefined> {
        const options = this.getOptions(initial)
        const providers = this.getProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.OpenSea]: OpenSea,
                [SourceType.Rarible]: Rarible,
                [SourceType.NFTScan]: NFTScan,
                [SourceType.Alchemy_EVM]: Alchemy_EVM,
            },
            options.chainId === ChainId.Mainnet ? [OpenSea, Alchemy_EVM, Rarible] : [Alchemy_EVM, OpenSea, Rarible],
            initial,
        )
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

        // only the first page is available
        if ((options.indicator ?? 0) > 0) return createPageable(EMPTY_LIST, createIndicator(options.indicator))

        const providers = this.getProviders<FungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.DeBank]: DeBank,
                [SourceType.Zerion]: Zerion,
            },
            [DeBank, Zerion],
            initial,
        )

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
        const providers = this.getProviders(
            {
                [SourceType.OpenSea]: OpenSea,
                [SourceType.Rarible]: Rarible,
                [SourceType.NFTScan]: NFTScan,
                [SourceType.Alchemy_EVM]: Alchemy_EVM,
            },
            options.chainId === ChainId.Mainnet ? [OpenSea, Alchemy_EVM, Rarible] : [Alchemy_EVM, OpenSea, Rarible],
            initial,
        )
        return attemptUntil(
            providers.map((x) => () => x.getAssets(options.account, options)),
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
        const providers = this.getProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.OpenSea]: OpenSea,
                [SourceType.Rarible]: Rarible,
                [SourceType.NFTScan]: NFTScan,
                [SourceType.Alchemy_EVM]: Alchemy_EVM,
            },
            options.chainId === ChainId.Mainnet ? [OpenSea, Alchemy_EVM, Rarible] : [Alchemy_EVM, OpenSea, Rarible],
            initial,
        )
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
        const options = this.getOptions(initial, {
            account,
        })
        const providers = this.getProviders(
            {
                [SourceType.OpenSea]: OpenSea,
                [SourceType.Rarible]: Rarible,
                [SourceType.Alchemy_EVM]: Alchemy_EVM,
            },
            options.chainId === ChainId.Mainnet ? [OpenSea, Alchemy_EVM, Rarible] : [Alchemy_EVM, OpenSea, Rarible],
            initial,
        )

        return attemptUntil(
            providers.map((x) => () => x.getAssets(options.account, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleTokenEvents(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<Pageable<NonFungibleTokenEvent<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.OpenSea]: OpenSea,
                [SourceType.Rarible]: Rarible,
                [SourceType.Alchemy_EVM]: Alchemy_EVM,
            },
            options.chainId === ChainId.Mainnet ? [OpenSea, Alchemy_EVM, Rarible] : [Alchemy_EVM, OpenSea, Rarible],
            initial,
        )

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
        const providers = this.getProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.OpenSea]: OpenSea,
                [SourceType.Rarible]: Rarible,
                [SourceType.Alchemy_EVM]: Alchemy_EVM,
            },
            options.chainId === ChainId.Mainnet ? [OpenSea, Alchemy_EVM, Rarible] : [Alchemy_EVM, OpenSea, Rarible],
            initial,
        )

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
        const providers = this.getProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.OpenSea]: OpenSea,
                [SourceType.Rarible]: Rarible,
                [SourceType.Alchemy_EVM]: Alchemy_EVM,
            },
            options.chainId === ChainId.Mainnet ? [OpenSea, Alchemy_EVM, Rarible] : [Alchemy_EVM, OpenSea, Rarible],
            initial,
        )

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
        const providers = this.getProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.OpenSea]: OpenSea,
                [SourceType.Rarible]: Rarible,
                [SourceType.Alchemy_EVM]: Alchemy_EVM,
            },
            options.chainId === ChainId.Mainnet ? [OpenSea, Alchemy_EVM, Rarible] : [Alchemy_EVM, OpenSea, Rarible],
            initial,
        )

        return attemptUntil(
            providers.map((x) => () => x.getOrders?.(address, tokenId, side, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleCollections(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleTokenCollection<ChainId>>> {
        const options = this.getOptions(initial, {
            account,
        })
        return OpenSea.getCollections(options.account, options)
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
