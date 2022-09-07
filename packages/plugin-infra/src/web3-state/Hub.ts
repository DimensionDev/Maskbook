import { memoize } from 'lodash-unified'
import type { Subscription } from 'use-subscription'
import {
    HubState as Web3HubState,
    Hub,
    HubOptions,
    SourceType,
    CurrencyType,
    createPredicate,
} from '@masknet/web3-shared-base'

const SIZE_PER_PAGE = 50
const MAX_PAGE_SIZE = 25

export class HubStateClient<ChainId> {
    constructor(
        protected chainId: ChainId,
        protected account: string,
        protected sourceType?: SourceType,
        protected currencyType?: CurrencyType,
    ) {}

    protected getOptions(
        initial?: HubOptions<ChainId>,
        overrides?: Partial<HubOptions<ChainId>>,
    ): PartialRequired<Required<HubOptions<ChainId>>, 'chainId' | 'account'> {
        return {
            chainId: this.chainId,
            account: this.account,
            sourceType: this.sourceType,
            currencyType: this.currencyType,
            ...initial,
            ...overrides,
        }
    }

    protected getProviders<T extends unknown>(
        providers: Partial<Record<SourceType, T>>,
        defaultProviders: T[],
        initial?: HubOptions<ChainId>,
    ) {
        const options = this.getOptions(initial)
        const predicate = createPredicate(Object.keys(providers) as Array<keyof typeof providers>)
        return predicate(options.sourceType) ? [providers[options.sourceType]!] : defaultProviders
    }
}

export class HubState<ChainId, SchemaType, GasOption> implements Web3HubState<ChainId, SchemaType, GasOption> {
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
                SIZE_PER_PAGE,
                MAX_PAGE_SIZE,
            ),
        )
    }
}
