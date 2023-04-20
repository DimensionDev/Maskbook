import { mixin, type Pageable } from '@masknet/shared-base'
import { AlchemyFlow, FlowFungible } from '@masknet/web3-providers'
import type { FungibleTokenAPI, NonFungibleTokenAPI } from '@masknet/web3-providers/types'
import { SourceType, type CurrencyType, type HubOptions, type Transaction } from '@masknet/web3-shared-base'
import { ChainId, type SchemaType } from '@masknet/web3-shared-flow'
import type { FlowHub } from './types.js'
import { HubStateBaseClient, HubStateFungibleClient, HubStateNonFungibleClient } from '../../../Base/state/Hub.js'

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

class Hub extends HubStateBaseClient<ChainId> implements FlowHub {
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
    return mixin(
        new Hub(chainId, account, sourceType, currencyType),
        new HubFungibleClient(chainId, account, sourceType, currencyType),
        new HubNonFungibleClient(chainId, account, sourceType, currencyType),
    )
}
