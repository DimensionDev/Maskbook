import {
    Alchemy_EVM,
    CoinGecko,
    DeBank,
    EthereumWeb3,
    MetaSwap,
    OpenSea,
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
    NetworkPluginID,
} from '@masknet/web3-shared-base'
import {
    ChainId as ChainId_EVM,
    chainResolver,
    formatEthereumAddress,
    GasOption,
    getCoinGeckoConstants,
    getTokenAssetBaseURLConstants,
    getTokenConstants,
    getTokenListConstants,
    SchemaType as SchemaType_EVM,
    isNativeTokenAddress,
} from '@masknet/web3-shared-evm'
import SPECIAL_ICON_LIST from './TokenIconSpecialIconList.json'
import type { EVM_Hub } from './types'

class Hub implements EVM_Hub {
    constructor(
        private chainId?: ChainId_EVM,
        private account?: string,
        private sourceType?: SourceType,
        private currencyType?: CurrencyType,
        private sizePerPage = 50,
        private maxPageSize = 25,
    ) {}

    async getFungibleTokensFromTokenList(
        chainId: ChainId_EVM,
        options?: HubOptions<ChainId_EVM> | undefined,
    ): Promise<Array<FungibleToken<ChainId_EVM, SchemaType_EVM>>> {
        const { FUNGIBLE_TOKEN_LISTS = [] } = getTokenListConstants(chainId)
        return TokenList.fetchFungibleTokensFromTokenLists(chainId, FUNGIBLE_TOKEN_LISTS)
    }
    async getNonFungibleTokensFromTokenList(
        chainId: ChainId_EVM,
        options?: HubOptions<ChainId_EVM> | undefined,
    ): Promise<Array<NonFungibleToken<ChainId_EVM, SchemaType_EVM>>> {
        throw new Error('Method not implemented.')
    }
    async getGasOptions(
        chainId: ChainId_EVM,
        options?: HubOptions<ChainId_EVM> | undefined,
    ): Promise<Record<GasOptionType, GasOption>> {
        try {
            const isEIP1559 = chainResolver.isSupport(chainId, 'EIP1559')
            if (isEIP1559) return await MetaSwap.getGasOptions(chainId)
            return await DeBank.getGasOptions(chainId)
        } catch (error) {
            return EthereumWeb3.getGasOptions(chainId)
        }
    }
    getFungibleAsset(
        address: string,
        options?: HubOptions<ChainId_EVM> | undefined,
    ): Promise<FungibleAsset<ChainId_EVM, SchemaType_EVM>> {
        throw new Error('Method not implemented.')
    }
    async getFungibleAssets(
        account: string,
        options?: HubOptions<ChainId_EVM> | undefined,
    ): Promise<Pageable<FungibleAsset<ChainId_EVM, SchemaType_EVM>>> {
        // only the first page is available
        if ((options?.indicator ?? 0) > 0) return createPageable([], 0)
        try {
            return await DeBank.getAssets(account, { chainId: this.chainId, ...options })
        } catch {
            return Zerion.getAssets(account, { chainId: this.chainId, ...options })
        }
    }
    async getNonFungibleAsset(
        address: string,
        tokenId: string,
        options?: HubOptions<ChainId_EVM> | undefined,
    ): Promise<NonFungibleAsset<ChainId_EVM, SchemaType_EVM> | undefined> {
        if (
            options?.sourceType === SourceType.Alchemy_FLOW ||
            options?.networkPluginId === NetworkPluginID.PLUGIN_FLOW
        ) {
            return Alchemy_EVM.getAsset(address, tokenId, options)
        }
        return OpenSea.getAsset(address, tokenId, options)
    }
    getNonFungibleAssets(
        account: string,
        options?: HubOptions<ChainId_EVM> | undefined,
    ): Promise<Pageable<NonFungibleAsset<ChainId_EVM, SchemaType_EVM>, string | number>> {
        if (options?.sourceType === SourceType.Alchemy_EVM) {
            return Alchemy_EVM.getTokens(account, options)
        }
        return OpenSea.getTokens(account, options)
    }
    getNonFungibleCollections(
        account: string,
        options?: HubOptions<ChainId_EVM> | undefined,
    ): Promise<Pageable<NonFungibleTokenCollection<ChainId_EVM>>> {
        return OpenSea.getCollections(account, options)
    }
    getFungibleTokenPrice(
        chainId: ChainId_EVM,
        address: string,
        options?: HubOptions<ChainId_EVM> | undefined,
    ): Promise<number> {
        const { PLATFORM_ID = '', COIN_ID = '' } = getCoinGeckoConstants(chainId)

        if (isNativeTokenAddress(address)) {
            return CoinGecko.getTokenPriceByCoinId(COIN_ID, options?.currencyType ?? this.currencyType)
        }

        return CoinGecko.getTokenPrice(PLATFORM_ID, address, options?.currencyType ?? this.currencyType)
    }
    getNonFungibleTokenPrice(
        chainId: ChainId_EVM,
        address: string,
        tokenId: string,
        options?: HubOptions<ChainId_EVM> | undefined,
    ): Promise<never> {
        throw new Error('Method not implemented.')
    }
    async getFungibleTokenIconURLs(
        chainId: ChainId_EVM,
        address: string,
        options?: HubOptions<ChainId_EVM> | undefined,
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
        chainId: ChainId_EVM,
        address: string,
        tokenId?: string | undefined,
        options?: HubOptions<ChainId_EVM> | undefined,
    ): Promise<string[]> {
        throw new Error('Method not implemented.')
    }
    async getTransactions(
        chainId: ChainId_EVM,
        account: string,
        options?: HubOptions<ChainId_EVM> | undefined,
    ): Promise<Pageable<Transaction<ChainId_EVM, SchemaType_EVM>>> {
        return DeBank.getTransactions(account, { chainId })
    }

    async *getAllFungibleAssets(address: string): AsyncIterableIterator<FungibleAsset<ChainId_EVM, SchemaType_EVM>> {
        for (let i = 0; i < this.maxPageSize; i += 1) {
            const pageable = await this.getFungibleAssets(address, {
                indicator: i,
                size: this.sizePerPage,
            })

            yield* pageable.data

            if (pageable.data.length === 0) return
        }
    }

    async *getAllNonFungibleAssets(
        address: string,
        options?: HubOptions<ChainId_EVM> | undefined,
    ): AsyncIterableIterator<NonFungibleAsset<ChainId_EVM, SchemaType_EVM>> {
        if (options?.sourceType === SourceType.Alchemy_EVM) {
            let api_keys = ''
            while (1) {
                const pageable = await this.getNonFungibleAssets(address, {
                    pageKey: api_keys,
                    chainId: options?.chainId,
                    sourceType: options?.sourceType,
                })
                api_keys = (pageable.nextIndicator as string) ?? ''

                yield* pageable.data

                if (pageable.data.length === 0 || !api_keys) return
            }
            return
        }
        for (let i = 0; i < this.maxPageSize; i += 1) {
            const pageable = await this.getNonFungibleAssets(address, {
                indicator: i,
                size: this.sizePerPage,
            })

            yield* pageable.data

            if (pageable.data.length === 0) return
        }
    }

    async *getAllNonFungibleCollections(
        address: string,
        options?: HubOptions<ChainId_EVM>,
    ): AsyncIterableIterator<NonFungibleTokenCollection<ChainId_EVM>> {
        for (let i = 0; i < this.maxPageSize; i += 1) {
            const pageable = await this.getNonFungibleCollections(address, {
                indicator: i,
                size: this.sizePerPage,
                chainId: options?.chainId,
            })

            yield* pageable.data

            if (pageable.data.length === 0) return
        }
    }
}

export function createHub(
    chainId?: ChainId_EVM,
    account?: string,
    sourceType?: SourceType,
    currencyType?: CurrencyType,
    sizePerPage?: number,
    maxPageSize?: number,
) {
    return new Hub(chainId, account, sourceType, currencyType, sizePerPage, maxPageSize)
}
