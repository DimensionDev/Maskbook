import { type SourceType, createPredicate } from '@masknet/web3-shared-base'
import { type HubOptionsAPI_Base, type HubOptions_Base } from './HubOptionsAPI.js'

export abstract class HubProviderAPI_Base<ChainId> {
    constructor(protected options?: HubOptions_Base<ChainId>) {}
    protected abstract HubOptions: HubOptionsAPI_Base<ChainId>

    protected getPredicateProviders<P>(
        providers: Partial<Record<SourceType, P>>,
        defaultProviders: P[],
        initial?: HubOptions_Base<ChainId>,
    ) {
        const options = this.HubOptions.fill(initial)
        const predicate = createPredicate(Object.keys(providers) as Array<keyof typeof providers>)
        return predicate(options.sourceType) ? [providers[options.sourceType]!] : defaultProviders
    }
}
