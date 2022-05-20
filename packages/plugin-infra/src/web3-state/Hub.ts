import type { Subscription } from 'use-subscription'
import type { HubState as Web3HubState, Hub, HubOptions, SourceType, CurrencyType } from '@masknet/web3-shared-base'

const SIZE_PER_PAGE = 50
const MAX_PAGE_SIZE = 25

export class HubState<ChainId, SchemaType, GasOption, Transaction>
    implements Web3HubState<ChainId, SchemaType, GasOption, Transaction>
{
    constructor(
        protected createHub: (
            chainId?: ChainId,
            account?: string,
            sourceType?: SourceType,
            currencyType?: CurrencyType,
            sizePerPage?: number,
            maxPageSize?: number,
        ) => Hub<ChainId, SchemaType, GasOption, Transaction>,
        protected subscription: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
            sourceType?: Subscription<SourceType>
            currencyType?: Subscription<CurrencyType>
        },
    ) {}

    getHub(options?: HubOptions<ChainId>) {
        return Promise.resolve(
            this.createHub(
                options?.chainId ?? this.subscription.chainId?.getCurrentValue(),
                options?.account ?? this.subscription.account?.getCurrentValue(),
                options?.sourceType ?? this.subscription.sourceType?.getCurrentValue(),
                options?.currencyType ?? this.subscription.currencyType?.getCurrentValue(),
                SIZE_PER_PAGE,
                MAX_PAGE_SIZE,
            ),
        )
    }
}
