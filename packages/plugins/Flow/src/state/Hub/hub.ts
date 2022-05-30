import { CoinGecko } from '@masknet/web3-providers'
import type {
    FungibleToken,
    NonFungibleToken,
    SourceType,
    CurrencyType,
    FungibleAsset,
    HubOptions,
    NonFungibleAsset,
    Pageable,
    GasOptionType,
    Transaction,
} from '@masknet/web3-shared-base'
import { ChainId, GasOption, getTokenConstants, SchemaType } from '@masknet/web3-shared-flow'
import { createFungibleToken } from '../../helpers'
import { FlowRPC } from '../../messages'
import type { FlowHub } from './types'

class Hub implements FlowHub {
    constructor(
        private chainId: ChainId,
        private account: string,
        private sourceType?: SourceType,
        private currencyType?: CurrencyType,
        private sizePerPage = 50,
        private maxPageSize = 25,
    ) {}

    async getFungibleTokensFromTokenList(
        chainId: ChainId,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Array<FungibleToken<ChainId, SchemaType>>> {
        const { FLOW_ADDRESS = '', FUSD_ADDRESS = '', TETHER_ADDRESS = '' } = getTokenConstants(chainId)
        return [
            createFungibleToken(
                chainId,
                FLOW_ADDRESS,
                'Flow',
                'FLOW',
                8,
                new URL('../../assets/flow.png', import.meta.url).toString(),
            ),
            createFungibleToken(
                chainId,
                FUSD_ADDRESS,
                'Flow USD',
                'FUSD',
                8,
                new URL('../../assets/FUSD.png', import.meta.url).toString(),
            ),
            createFungibleToken(
                chainId,
                TETHER_ADDRESS,
                'Tether USD',
                'tUSD',
                8,
                new URL('../../assets/tUSD.png', import.meta.url).toString(),
            ),
        ]
    }
    async getNonFungibleTokensFromTokenList(
        chainId: ChainId,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Array<NonFungibleToken<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }
    getGasOptions(
        chainId: ChainId,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Record<GasOptionType, GasOption>> {
        throw new Error('Method not implemented.')
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
        return FlowRPC.getFungibleAssets(options?.chainId ?? this.chainId, account)
    }
    async getNonFungibleAsset(
        address: string,
        tokenId: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<NonFungibleAsset<ChainId, SchemaType> | undefined> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleAssets(
        account: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }
    getFungibleTokenPrice(
        chainId: ChainId,
        address: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<number> {
        return CoinGecko.getTokenPrice(address, options?.currencyType)
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
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenIconURLs(
        chainId: ChainId,
        address: string,
        tokenId?: string | undefined,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<string[]> {
        throw new Error('Method not implemented.')
    }
    getTransactions(
        chainId: ChainId,
        account: string,
        options?: HubOptions<ChainId> | undefined,
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
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
    chainId = ChainId.Mainnet,
    account = '',
    sourceType?: SourceType,
    currencyType?: CurrencyType,
    sizePerPage?: number,
    maxPageSize?: number,
) {
    return new Hub(chainId, account, sourceType, currencyType, sizePerPage, maxPageSize)
}
