import type { PartialRequired } from '@masknet/shared-base'
import {
    Alchemy_EVM,
    CoinGecko,
    DeBank,
    EthereumWeb3,
    MetaSwap,
    AstarGas,
    OpenSea,
    NFTScan,
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
    FungibleTokenSecurity,
    FungibleTokenAuthorization,
    NonFungibleTokenAuthorization,
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

    async getFungibleTokenSecurity(
        chainId: ChainId,
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<FungibleTokenSecurity> {
        const options = this.getOptions(initial, {
            chainId,
        })

        console.log(options)
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

        console.log(options)
        throw new Error('Method not implemented.')
    }

    async getFungibleTokensFromTokenList(
        chainId: ChainId,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<FungibleToken<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
            chainId,
        })
        const { FUNGIBLE_TOKEN_LISTS = [] } = getTokenListConstants(options.chainId)
        return TokenList.fetchFungibleTokensFromTokenLists(options.chainId, FUNGIBLE_TOKEN_LISTS)
    }
    async getNonFungibleTokensFromTokenList(
        chainId: ChainId,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<NonFungibleToken<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }
    async getGasOptions(chainId: ChainId, initial?: HubOptions<ChainId>): Promise<Record<GasOptionType, GasOption>> {
        const options = this.getOptions(initial, {
            chainId,
        })
        try {
            const isEIP1559 = chainResolver.isSupport(options.chainId, 'EIP1559')
            if (isEIP1559 && chainId !== 592) return await MetaSwap.getGasOptions(options.chainId)
            if (chainId === 592) return await AstarGas.getGasOptions(options.chainId)
            return await DeBank.getGasOptions(options.chainId)
        } catch (error) {
            return EthereumWeb3.getGasOptions(options.chainId)
        }
    }
    getFungibleAsset(address: string, initial?: HubOptions<ChainId>): Promise<FungibleAsset<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    async getFungibleAssets(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
            account,
        })

        // only the first page is available
        if ((options.indicator ?? 0) > 0) return createPageable([], createIndicator(options.indicator))

        const providers = {
            [SourceType.DeBank]: DeBank,
            [SourceType.Zerion]: Zerion,
        }
        const predicate = createPredicate(Object.keys(providers) as Array<keyof typeof providers>)
        const filteredProviders = predicate(options.sourceType) ? [providers[options.sourceType]] : [DeBank, Zerion]
        return attemptUntil(
            filteredProviders.map((x) => () => x.getAssets(options.account, options)),
            createPageable([], createIndicator(options.indicator)),
        )
    }
    async getNonFungibleAsset(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId>,
    ): Promise<NonFungibleAsset<ChainId, SchemaType> | undefined> {
        const options = this.getOptions(initial)
        const providers = {
            [SourceType.OpenSea]: OpenSea,
            [SourceType.Rarible]: Rarible,
            [SourceType.NFTScan]: NFTScan,
            [SourceType.Alchemy_EVM]: Alchemy_EVM,
        }
        const predicate = createPredicate(Object.keys(providers) as Array<keyof typeof providers>)
        const defaultProviders =
            options.chainId === ChainId.Mainnet ? [OpenSea, Alchemy_EVM, Rarible] : [Alchemy_EVM, OpenSea, Rarible]
        const filteredProviders = predicate(options.sourceType) ? [providers[options.sourceType]] : defaultProviders
        return attemptUntil(
            filteredProviders.map((x) => () => x.getAsset(address, tokenId, options)),
            undefined,
        )
    }
    async getNonFungibleTokens(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
            account,
        })
        const providers = {
            [SourceType.OpenSea]: OpenSea,
            [SourceType.Rarible]: Rarible,
            [SourceType.Alchemy_EVM]: Alchemy_EVM,
        }
        const predicate = createPredicate(Object.keys(providers) as Array<keyof typeof providers>)
        const defaultProviders =
            options.chainId === ChainId.Mainnet ? [OpenSea, Alchemy_EVM, Rarible] : [Alchemy_EVM, OpenSea, Rarible]
        const filteredProviders = predicate(options.sourceType) ? [providers[options.sourceType]] : defaultProviders

        return attemptUntil(
            filteredProviders.map((x) => () => x.getAssets(options.account, options)),
            createPageable([], createIndicator(options.indicator)),
        )
    }
    getNonFungibleCollections(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleTokenCollection<ChainId>>> {
        const options = this.getOptions(initial, {
            account,
        })
        return OpenSea.getCollections(options.account, options)
    }
    getFungibleTokenPrice(chainId: ChainId, address: string, initial?: HubOptions<ChainId>): Promise<number> {
        const options = this.getOptions(initial, {
            chainId,
        })
        const { PLATFORM_ID = '', COIN_ID = '' } = getCoinGeckoConstants(options.chainId)

        if (isNativeTokenAddress(address)) {
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
        const options = this.getOptions(initial, {
            chainId,
        })
        const { TOKEN_ASSET_BASE_URI = [] } = getTokenAssetBaseURLConstants(options.chainId)
        const checkSummedAddress = formatEthereumAddress(address)

        if (isSameAddress(getTokenConstants(chainId).NATIVE_TOKEN_ADDRESS, checkSummedAddress)) {
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
        initial?: HubOptions<ChainId>,
    ): Promise<string[]> {
        throw new Error('Method not implemented.')
    }
    getApprovedFungibleTokens(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<FungibleTokenAuthorization<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }
    getApprovedNonFungibleTokens(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<NonFungibleTokenAuthorization<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
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
}

export function createHub(
    chainId = ChainId.Mainnet,
    account = '',
    sourceType?: SourceType,
    currencyType?: CurrencyType,
) {
    return new Hub(chainId, account, sourceType, currencyType)
}
