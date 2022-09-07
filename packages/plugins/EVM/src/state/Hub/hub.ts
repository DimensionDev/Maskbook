import { assignIn } from 'lodash-unified'
import { HubStateBaseClient, HubStateFungibleClient, HubStateNonFungibleClient } from '@masknet/plugin-infra/web3'
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
    TokenIconAPI,
    LooksRare,
    Gem,
    Zora,
    R2D2,
    PriceAPI,
    CF,
} from '@masknet/web3-providers'
import { SourceType, HubOptions, Pageable, CurrencyType, Transaction } from '@masknet/web3-shared-base'
import { ChainId, chainResolver, SchemaType } from '@masknet/web3-shared-evm'
import type { EVM_Hub } from './types'

class Hub extends HubStateBaseClient<ChainId> implements EVM_Hub {
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
                TokenListAPI.Provider<ChainId, SchemaType> &
                TokenIconAPI.Provider<ChainId> &
                PriceAPI.Provider<ChainId>
        >(
            {
                [SourceType.DeBank]: DeBank,
                [SourceType.Zerion]: Zerion,
                [SourceType.Rabby]: Rabby,
                [SourceType.R2D2]: R2D2,
                [SourceType.CF]: CF,
            },
            [DeBank, Zerion, Rabby, R2D2],
            initial,
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
