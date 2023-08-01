import { memoize } from 'lodash-es'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { HubOptions_Base, HubOptionsAPI_Base } from './HubOptionsAPI.js'
import type { OthersAPI_Base } from './OthersAPI.js'
import type { HubAPI_Base } from './HubAPI.js'

const resolver = <ChainId>(initial?: HubOptions_Base<ChainId>) => {
    return [initial?.chainId, initial?.account, initial?.currencyType, initial?.sourceType].join(',')
}

export class HubCreatorAPI_Base<T extends NetworkPluginID> {
    constructor(
        protected creator: (
            initial?: HubOptions_Base<Web3Helper.Definition[T]['ChainId']>,
        ) => HubAPI_Base<
            Web3Helper.Definition[T]['ChainId'],
            Web3Helper.Definition[T]['SchemaType'],
            Web3Helper.Definition[T]['ProviderType'],
            Web3Helper.Definition[T]['NetworkType'],
            Web3Helper.Definition[T]['MessageRequest'],
            Web3Helper.Definition[T]['MessageResponse'],
            Web3Helper.Definition[T]['Transaction'],
            Web3Helper.Definition[T]['TransactionParameter'],
            Web3Helper.Definition[T]['GasOption']
        >,
        protected Web3Others: OthersAPI_Base<
            Web3Helper.Definition[T]['ChainId'],
            Web3Helper.Definition[T]['SchemaType'],
            Web3Helper.Definition[T]['ProviderType'],
            Web3Helper.Definition[T]['NetworkType'],
            Web3Helper.Definition[T]['Transaction']
        >,
        protected Web3HubOptions: HubOptionsAPI_Base<
            Web3Helper.Definition[T]['ChainId'],
            Web3Helper.Definition[T]['SchemaType'],
            Web3Helper.Definition[T]['ProviderType'],
            Web3Helper.Definition[T]['NetworkType'],
            Web3Helper.Definition[T]['MessageRequest'],
            Web3Helper.Definition[T]['MessageResponse'],
            Web3Helper.Definition[T]['Transaction'],
            Web3Helper.Definition[T]['TransactionParameter']
        >,
    ) {}

    private createCached = memoize(this.creator, resolver<Web3Helper.Definition[T]['ChainId']>)

    create(initial?: HubOptions_Base<Web3Helper.Definition[T]['ChainId']>) {
        const options = this.Web3HubOptions.fill(initial)
        if (!this.Web3Others.isValidChainId(options.chainId!)) return
        return this.createCached(initial)
    }
}
