import { EMPTY_LIST, mixin } from '@masknet/shared-base'
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
    Approval,
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
    SimpleHashEVM,
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
    type CurrencyType,
    type Transaction,
    attemptUntil,
} from '@masknet/web3-shared-base'
import { type Pageable, createPageable, createIndicator } from '@masknet/shared-base'
import { ChainId, chainResolver, type SchemaType } from '@masknet/web3-shared-evm'
import type { EVM_Hub } from './types.js'
import { Web3StateRef } from '../../apis/Web3StateAPI.js'
import { HubStateBaseClient, HubStateFungibleClient, HubStateNonFungibleClient } from '../../../Base/state/Hub.js'

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
                [SourceType.Approval]: Approval,
                [SourceType.R2D2]: R2D2TokenList,
                [SourceType.CF]: Cloudflare,
                [SourceType.CoinGecko]: CoinGeckoPriceEVM,
            },
            [
                DeBankFungibleToken,
                Approval,
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

    override getFungibleToken(address: string, initial?: HubOptions<ChainId> | undefined) {
        const connection = Web3StateRef.value.Connection?.getConnection?.({
            chainId: initial?.chainId,
        })

        return attemptUntil(
            [
                () =>
                    Web3StateRef.value.Token?.createFungibleToken?.(initial?.chainId ?? ChainId.Mainnet, address ?? ''),
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
                [SourceType.Approval]: Approval,
                [SourceType.Alchemy_EVM]: AlchemyEVM,
                [SourceType.LooksRare]: LooksRare,
                [SourceType.Zora]: Zora,
                [SourceType.Gem]: Gem,
                [SourceType.GoPlus]: GoPlusAuthorization,
                [SourceType.Rabby]: Rabby,
                [SourceType.R2D2]: R2D2TokenList,
                [SourceType.SimpleHash]: SimpleHashEVM,
            },
            options.chainId === ChainId.Mainnet
                ? [
                      X2Y2,
                      SimpleHashEVM,
                      NFTScanNonFungibleTokenEVM,
                      ZerionNonFungibleToken,
                      Rarible,
                      OpenSea,
                      AlchemyEVM,
                      LooksRare,
                      Zora,
                      Gem,
                      Approval,
                      GoPlusAuthorization,
                      Rabby,
                      R2D2TokenList,
                  ]
                : [
                      SimpleHashEVM,
                      NFTScanNonFungibleTokenEVM,
                      ZerionNonFungibleToken,
                      Rarible,
                      AlchemyEVM,
                      OpenSea,
                      LooksRare,
                      Zora,
                      Approval,
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
