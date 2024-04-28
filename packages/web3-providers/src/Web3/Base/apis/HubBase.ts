import type { Pageable } from '@masknet/shared-base'
import type { GasOptionType, Transaction as Web3Transaction } from '@masknet/web3-shared-base'
import type { BaseHubOptions } from './HubOptions.js'
import { AbstractBaseHubProvider } from './HubProvider.js'

export abstract class BaseHubProvider<ChainId, SchemaType, GasOption> extends AbstractBaseHubProvider<ChainId> {
    abstract getGasOptions?(
        chainId: ChainId,
        initial?: BaseHubOptions<ChainId>,
    ): Promise<Record<GasOptionType, GasOption> | undefined>

    abstract getGasLimit?(
        chainId: ChainId,
    ): readonly [min: string | undefined, defaultGas: string | undefined, max: string | undefined] | undefined

    abstract getTransactions?(
        chainId: ChainId,
        account: string,
        initial?: BaseHubOptions<ChainId>,
    ): Promise<Pageable<Web3Transaction<ChainId, SchemaType>>>
}
