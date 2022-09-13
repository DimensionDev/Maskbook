import { memoize } from 'lodash-unified'
import type { Subscription } from 'use-subscription'
import type { HubState as Web3HubState, Hub, HubOptions, SourceType, CurrencyType } from '@masknet/web3-shared-base'

export * from './Hub/BaseClient.js'
export * from './Hub/FungibleClient.js'
export * from './Hub/NonFungibleClient.js'

export class HubState<ChainId, SchemaType, GasOption> implements Web3HubState<ChainId, SchemaType, GasOption> {
    static SIZE_PER_PAGE = 50
    static MAX_PAGE_SIZE = 25

    private createHubCached: (ReturnType<typeof memoize> & typeof this.createHub) | undefined

    constructor(
        protected createHub: (
            chainId?: ChainId,
            account?: string,
            sourceType?: SourceType,
            currencyType?: CurrencyType,
            sizePerPage?: number,
            maxPageSize?: number,
        ) => Hub<ChainId, SchemaType, GasOption>,
        protected subscription: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
            sourceType?: Subscription<SourceType>
            currencyType?: Subscription<CurrencyType>
        },
    ) {
        this.createHubCached = memoize(
            (
                chainId?: ChainId,
                account?: string,
                sourceType?: SourceType,
                currencyType?: CurrencyType,
                sizePerPage?: number,
                maxPageSize?: number,
            ) => {
                return this.createHub(chainId, account, sourceType, currencyType, sizePerPage, maxPageSize)
            },
            (
                chainId?: ChainId,
                account?: string,
                sourceType?: SourceType,
                currencyType?: CurrencyType,
                sizePerPage?: number,
                maxPageSize?: number,
            ) => {
                return [chainId, account, sourceType, currencyType, sizePerPage, maxPageSize].join()
            },
        )
    }

    getHub(options?: HubOptions<ChainId>) {
        return Promise.resolve(
            this.createHubCached?.(
                options?.chainId ?? this.subscription.chainId?.getCurrentValue(),
                options?.account ?? this.subscription.account?.getCurrentValue(),
                options?.sourceType ?? this.subscription.sourceType?.getCurrentValue(),
                options?.currencyType ?? this.subscription.currencyType?.getCurrentValue(),
                HubState.SIZE_PER_PAGE,
                HubState.MAX_PAGE_SIZE,
            ),
        )
    }
}
