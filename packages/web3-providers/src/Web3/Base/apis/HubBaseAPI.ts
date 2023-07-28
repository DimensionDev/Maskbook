import type { Pageable } from '@masknet/shared-base'
import type { GasOptionType, Transaction as Web3Transaction } from '@masknet/web3-shared-base'
import type { HubOptions_Base } from './HubOptionsAPI.js'
import { HubProviderAPI_Base } from './HubProviderAPI.js'

export class HubBaseAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
    Transaction,
    TransactionParameter,
    GasOption,
> extends HubProviderAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
    Transaction,
    TransactionParameter
> {
    getGasOptions(
        chainId: ChainId,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Record<GasOptionType, GasOption> | undefined> {
        throw new Error('Method not implemented.')
    }

    getTransactions(
        chainId: ChainId,
        account: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Pageable<Web3Transaction<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }
}
