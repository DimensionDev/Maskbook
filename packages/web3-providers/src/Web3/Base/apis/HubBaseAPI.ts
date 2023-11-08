import type { Pageable } from '@masknet/shared-base'
import type { GasOptionType, Transaction as Web3Transaction } from '@masknet/web3-shared-base'
import type { HubOptions_Base } from './HubOptionsAPI.js'
import { HubProviderAPI_Base } from './HubProviderAPI.js'

export abstract class HubBaseAPI_Base<ChainId, SchemaType, GasOption> extends HubProviderAPI_Base<ChainId> {
    abstract getGasOptions?(
        chainId: ChainId,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Record<GasOptionType, GasOption> | undefined>
    abstract getTransactions?(
        chainId: ChainId,
        account: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Pageable<Web3Transaction<ChainId, SchemaType>>>
}
