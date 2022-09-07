import { assignIn } from 'lodash-unified'
import { HubStateClient, HubStateFungibleClient, HubStateNonFungibleClient } from '@masknet/plugin-infra/web3'
import { AlchemyFlow, FlowFungible, FungibleTokenAPI, NonFungibleTokenAPI } from '@masknet/web3-providers'
import { SourceType, CurrencyType, HubOptions, Pageable, Transaction } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-flow'
import type { FlowHub } from './types'

class HubFungibleClient extends HubStateFungibleClient<ChainId, SchemaType> {
    protected override getProviders(initial?: HubOptions<ChainId>) {
        return this.getPredicateProviders<FungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.Flow]: FlowFungible,
            },
            [FlowFungible],
            initial,
        )
    }
}

class HubNonFungibleClient extends HubStateNonFungibleClient<ChainId, SchemaType> {
    protected override getProviders(initial?: HubOptions<ChainId>) {
        return this.getPredicateProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.Alchemy_FLOW]: AlchemyFlow,
            },
            [AlchemyFlow],
            initial,
        )
    }
}

class Hub extends HubStateClient<ChainId> implements FlowHub {
    getTransactions(
        chainId: ChainId,
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
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
