import { EMPTY_LIST, mixin } from '@masknet/shared-base'
import { HubStateBaseClient, HubStateFungibleClient, HubStateNonFungibleClient } from '@masknet/web3-state'
import {
    AlchemyEVM,
    Web3GasOption,
    MetaSwap,
    AstarGas,
    NFTScanNonFungibleTokenEVM,
    OpenSea,
    Rarible,
    Zerion,
    Rabby,
    LooksRare,
    Gem,
    Zora,
    R2D2TokenList,
    Cloudflare,
    CoinGeckoPriceEVM,
    ChainbaseFungibleToken,
    ChainbaseNonFungibleToken,
    ZerionNonFungibleToken,
    X2Y2,
    GoPlusAuthorization,
    DeBankGasOption,
    DeBankFungibleToken,
    DeBankHistory,
} from '@masknet/web3-providers'
import type {
    AuthorizationAPI,
    FungibleTokenAPI,
    NonFungibleTokenAPI,
    TokenListAPI,
    TokenIconAPI,
    PriceAPI,
} from '@masknet/web3-providers/types'
import {
    SourceType,
    type HubOptions,
    type Pageable,
    type CurrencyType,
    type Transaction,
    type HubIndicator,
    attemptUntil,
    createPageable,
    createIndicator,
} from '@masknet/web3-shared-base'
import { ChainId, chainResolver, type SchemaType } from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../settings/index.js'
import type { EVM_Hub } from './types.js'

class Hub extends HubStateBaseClient<ChainId> implements EVM_Hub {
    async getGasOptions(chainId: ChainId, initial?: HubOptions<ChainId>) {
        const options = this.getOptions(initial, {
            chainId,
        })
        try {
            const isEIP1559 = chainResolver.isSupport(options.chainId, 'EIP1559')
            if (isEIP1559 && chainId !== ChainId.Astar) return await MetaSwap.getGasOptions(options.chainId)
            if (chainId === ChainId.Astar) return await AstarGas.getGasOptions(options.chainId)
            return await DeBankGasOption.getGasOptions(options.chainId)
        } catch (error) {
            return Web3GasOption.getGasOptions(options.chainId)
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
        return attemptUntil(
            [DeBankHistory, Zerion].map((x) => () => x.getTransactions(options.account, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }
}

class HubFungibleClient extends HubStateFungibleClient<ChainId, SchemaType> {
    protected override getProviders(initial?: HubOptions<ChainId>) {
        const { indicator } = this.getOptions(initial)

        // only the first page is available
        if ((indicator?.index ?? 0) > 0) return []

        return this.getPredicateProviders<
            AuthorizationAPI.Provider<ChainId> &
                FungibleTokenAPI.Provider<ChainId, SchemaType> &
                TokenListAPI.Provider<ChainId, SchemaType> &
                TokenIconAPI.Provider<ChainId> &
                PriceAPI.Provider<ChainId>
        >(
            {
                [SourceType.Chainbase]: ChainbaseFungibleToken,
                [SourceType.DeBank]: DeBankFungibleToken,
                [SourceType.Zerion]: Zerion,
                [SourceType.GoPlus]: GoPlusAuthorization,
                [SourceType.Rabby]: Rabby,
                [SourceType.R2D2]: R2D2TokenList,
                [SourceType.CF]: Cloudflare,
                [SourceType.CoinGecko]: CoinGeckoPriceEVM,
            },
            [
                DeBankFungibleToken,
                Zerion,
                ChainbaseFungibleToken,
                Rabby,
                GoPlusAuthorization,
                R2D2TokenList,
                Cloudflare,
                CoinGeckoPriceEVM,
            ],
            initial,
        )
    }

    override getFungibleToken(address: string, initial?: HubOptions<ChainId, HubIndicator> | undefined) {
        const connection = Web3StateSettings.value.Connection?.getConnection?.({
            chainId: initial?.chainId,
        })

        return attemptUntil(
            [
                () =>
                    Web3StateSettings.value.Token?.createFungibleToken?.(
                        initial?.chainId ?? ChainId.Mainnet,
                        address ?? '',
                    ),
                () => connection?.getFungibleToken?.(address ?? '', initial),
            ],
            undefined,
        )
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
                [SourceType.X2Y2]: X2Y2,
                [SourceType.Chainbase]: ChainbaseNonFungibleToken,
                [SourceType.Zerion]: ZerionNonFungibleToken,
                [SourceType.NFTScan]: NFTScanNonFungibleTokenEVM,
                [SourceType.Rarible]: Rarible,
                [SourceType.OpenSea]: OpenSea,
                [SourceType.Alchemy_EVM]: AlchemyEVM,
                [SourceType.LooksRare]: LooksRare,
                [SourceType.Zora]: Zora,
                [SourceType.Gem]: Gem,
                [SourceType.GoPlus]: GoPlusAuthorization,
                [SourceType.Rabby]: Rabby,
                [SourceType.R2D2]: R2D2TokenList,
            },
            options.chainId === ChainId.Mainnet
                ? [
                      X2Y2,
                      NFTScanNonFungibleTokenEVM,
                      ZerionNonFungibleToken,
                      Rarible,
                      OpenSea,
                      AlchemyEVM,
                      LooksRare,
                      Zora,
                      Gem,
                      GoPlusAuthorization,
                      Rabby,
                      R2D2TokenList,
                  ]
                : [
                      NFTScanNonFungibleTokenEVM,
                      ZerionNonFungibleToken,
                      Rarible,
                      AlchemyEVM,
                      OpenSea,
                      LooksRare,
                      Zora,
                      Gem,
                      GoPlusAuthorization,
                      Rabby,
                      R2D2TokenList,
                  ],
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
    return mixin(
        new Hub(chainId, account, sourceType, currencyType),
        new HubFungibleClient(chainId, account, sourceType, currencyType),
        new HubNonFungibleClient(chainId, account, sourceType, currencyType),
    )
}
