import type { PartialRequired } from '@masknet/shared-base'
import { Alchemy_FLOW } from '@masknet/web3-providers'
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

    async getFungibleTokensFromTokenList(
        chainId: ChainId,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<FungibleToken<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
            chainId,
        })
        const { FLOW_ADDRESS = '', FUSD_ADDRESS = '', TETHER_ADDRESS = '' } = getTokenConstants(options.chainId)
        return [
            createFungibleToken(
                options.chainId,
                FLOW_ADDRESS,
                'Flow',
                'FLOW',
                8,
                new URL('../../assets/flow.png', import.meta.url).toString(),
            ),
            createFungibleToken(
                options.chainId,
                FUSD_ADDRESS,
                'Flow USD',
                'FUSD',
                8,
                new URL('../../assets/FUSD.png', import.meta.url).toString(),
            ),
            createFungibleToken(
                options.chainId,
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
        initial?: HubOptions<ChainId>,
    ): Promise<Array<NonFungibleToken<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }
    getGasOptions(chainId: ChainId, initial?: HubOptions<ChainId>): Promise<Record<GasOptionType, GasOption>> {
        throw new Error('Method not implemented.')
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
        return FlowRPC.getFungibleAssets(options.chainId, options.account)
    }
    async getNonFungibleAsset(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId>,
        ownerAddress?: string,
        contractName?: string,
    ): Promise<NonFungibleAsset<ChainId, SchemaType> | undefined> {
        const options = this.getOptions(initial)
        return Alchemy_FLOW.getAsset(address, tokenId, options, ownerAddress, contractName)
    }
    getNonFungibleTokens(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
            account,
        })
        return Alchemy_FLOW.getAssets(options.account, options)
    }
    getFungibleTokenPrice(chainId: ChainId, address: string, initial?: HubOptions<ChainId>): Promise<number> {
        // The Flow chain is unlisted in CoinGecko.
        throw new Error('Method not implemented.')
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
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenIconURLs(
        chainId: ChainId,
        address: string,
        tokenId?: string | undefined,
        initial?: HubOptions<ChainId>,
    ): Promise<string[]> {
        throw new Error('Method not implemented.')
    }
    getTransactions(
        chainId: ChainId,
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<Transaction<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
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
