import { type SourceType, createPredicate } from '@masknet/web3-shared-base'
import { HubOptionsAPI_Base, type HubOptions_Base } from './HubOptionsAPI.js'

export class HubProviderAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
> {
    constructor(protected options?: HubOptions_Base<ChainId>) {}

    protected HubOptions = new HubOptionsAPI_Base<
        ChainId,
        SchemaType,
        ProviderType,
        NetworkType,
        MessageRequest,
        MessageResponse,
        Transaction,
        TransactionParameter
    >(this.options)

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
