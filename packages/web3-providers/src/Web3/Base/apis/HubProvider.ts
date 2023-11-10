import { type SourceType, createPredicate } from '@masknet/web3-shared-base'
import { type HubOptionsProvider, type BaseHubOptions } from './HubOptions.js'

export abstract class AbstractBaseHubProvider<ChainId> {
    constructor(protected options?: BaseHubOptions<ChainId>) {}

    protected abstract HubOptions: HubOptionsProvider<ChainId>

    protected getPredicateProviders<P>(
        providers: Partial<Record<SourceType, P>>,
        defaultProviders: P[],
        initial?: BaseHubOptions<ChainId>,
    ) {
        const options = this.HubOptions.fill(initial)
        const predicate = createPredicate(Object.keys(providers) as Array<keyof typeof providers>)
        return predicate(options.sourceType) ? [providers[options.sourceType]!] : defaultProviders
    }
}
