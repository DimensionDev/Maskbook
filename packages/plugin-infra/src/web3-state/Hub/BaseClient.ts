import { HubOptions, SourceType, CurrencyType, createPredicate } from '@masknet/web3-shared-base'

export class HubStateBaseClient<ChainId> {
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

    protected getPredicateProviders<T extends unknown>(
        providers: Partial<Record<SourceType, T>>,
        defaultProviders: T[],
        initial?: HubOptions<ChainId>,
    ) {
        const options = this.getOptions(initial)
        const predicate = createPredicate(Object.keys(providers) as Array<keyof typeof providers>)
        return predicate(options.sourceType) ? [providers[options.sourceType]!] : defaultProviders
    }
}
