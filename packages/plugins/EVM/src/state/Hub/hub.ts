import { assignIn } from 'lodash-unified'
import { HubStateClient, HubStateFungibleClient, HubStateNonFungibleClient } from '@masknet/plugin-infra/web3'
import {
    AlchemyEVM,
    DeBank,
    EthereumWeb3,
    MetaSwap,
    AstarGas,
    NFTScanNonFungibleTokenEVM,
    OpenSea,
    Rarible,
    Zerion,
    Rabby,
    AuthorizationAPI,
    FungibleTokenAPI,
    NonFungibleTokenAPI,
    TokenListAPI,
    LooksRare,
    Gem,
    Zora,
    R2D2,
    CoinGecko,
} from '@masknet/web3-providers'
import {
    SourceType,
    HubOptions,
    Pageable,
    CurrencyType,
    Transaction,
    currySameAddress,
} from '@masknet/web3-shared-base'
import {
    ChainId,
    chainResolver,
    formatEthereumAddress,
    getCoinGeckoConstants,
    getTokenAssetBaseURLConstants,
    isNativeTokenAddress,
    SchemaType,
} from '@masknet/web3-shared-evm'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { EVM_Hub } from './types'
import SPECIAL_ICON_LIST from './TokenIconSpecialIconList.json'

class Hub extends HubStateClient<ChainId> implements EVM_Hub {
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
}

class HubFungibleClient extends HubStateFungibleClient<ChainId, SchemaType> {
    protected override getProviders(initial?: HubOptions<ChainId>) {
        const options = this.getOptions(initial)

        // only the first page is available
        if ((options.indicator ?? 0) > 0) return []

        return this.getPredicateProviders<
            AuthorizationAPI.Provider<ChainId> &
                FungibleTokenAPI.Provider<ChainId, SchemaType> &
                TokenListAPI.Provider<ChainId, SchemaType>
        >(
            {
                [SourceType.DeBank]: DeBank,
                [SourceType.Zerion]: Zerion,
                [SourceType.Rabby]: Rabby,
                [SourceType.R2D2]: R2D2,
            },
            [DeBank, Zerion, Rabby, R2D2],
            initial,
        )
    }

    override async getFungibleTokenIconURLs(
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
            return NATIVE_TOKEN_ASSET_BASE_URI?.map((x) => `${x}/info/logo.png`)
        }

        const specialIcon = SPECIAL_ICON_LIST.find(currySameAddress(address))
        if (specialIcon) return [specialIcon.logo_url]

        // load from remote
        return ERC20_TOKEN_ASSET_BASE_URI.map((x) => `${x}/${formattedAddress}/logo.png/quality=85`)
    }

    override async getFungibleTokenPrice(
        chainId: ChainId,
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<number> {
        const options = this.getOptions(initial, {
            chainId,
        })
        const { PLATFORM_ID = '', COIN_ID = '' } = getCoinGeckoConstants(options.chainId)

        if (isNativeTokenAddress(address)) {
            return CoinGecko.getTokenPriceByCoinId(COIN_ID, options.currencyType)
        }
        return CoinGecko.getTokenPrice(PLATFORM_ID, address, options.currencyType)
    }
}

class HubNonFungibleClient extends HubStateNonFungibleClient<ChainId, SchemaType> {
    protected override getProviders(initial?: HubOptions<ChainId>) {
        const options = this.getOptions(initial)
        return this.getPredicateProviders<
            | AuthorizationAPI.Provider<ChainId>
            | NonFungibleTokenAPI.Provider<ChainId, SchemaType>
            | TokenListAPI.Provider<ChainId, SchemaType>
        >(
            {
                [SourceType.NFTScan]: NFTScanNonFungibleTokenEVM,
                [SourceType.Rarible]: Rarible,
                [SourceType.OpenSea]: OpenSea,
                [SourceType.Alchemy_EVM]: AlchemyEVM,
                [SourceType.LooksRare]: LooksRare,
                [SourceType.Zora]: Zora,
                [SourceType.Gem]: Gem,
                [SourceType.Rabby]: Rabby,
                [SourceType.R2D2]: R2D2,
            },
            options.chainId === ChainId.Mainnet
                ? [NFTScanNonFungibleTokenEVM, Rarible, OpenSea, AlchemyEVM, LooksRare, Zora, Gem, Rabby, R2D2]
                : [NFTScanNonFungibleTokenEVM, Rarible, AlchemyEVM, OpenSea, LooksRare, Zora, Gem, Rabby, R2D2],
            initial,
        )
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
