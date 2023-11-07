import { EMPTY_LIST, type Pageable, createPageable, createIndicator } from '@masknet/shared-base'
import { attemptUntil, type Transaction as Web3Transaction } from '@masknet/web3-shared-base'
import {
    ChainId,
    type GasOption,
    type SchemaType,
    type ProviderType,
    type NetworkType,
    type MessageRequest,
    type MessageResponse,
    type Transaction,
    type TransactionParameter,
} from '@masknet/web3-shared-evm'
import { ChainResolver } from './ResolverAPI.js'
import { HubBaseAPI_Base } from '../../Base/apis/HubBaseAPI.js'
import { GasOptions } from './GasOptionAPI.js'
import { HubOptionsAPI } from './HubOptionsAPI.js'
import type { HubOptions } from '../types/index.js'
import { MetaSwap } from '../../../MetaSwap/index.js'
import { AstarGas } from '../../../Astar/index.js'
import { DeBankGasOption, DeBankHistory } from '../../../DeBank/index.js'
import { Zerion } from '../../../Zerion/index.js'

export class HubBaseAPI extends HubBaseAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
    GasOption
> {
    protected override HubOptions = new HubOptionsAPI(this.options)

    async getGasOptions(chainId: ChainId, initial?: HubOptions) {
        const options = this.HubOptions.fill({
            ...initial,
            chainId,
        })
        try {
            const isEIP1559 = ChainResolver.isFeatureSupported(options.chainId, 'EIP1559')
            if (isEIP1559 && chainId !== ChainId.Astar) return await MetaSwap.getGasOptions(options.chainId)
            if (chainId === ChainId.Aurora) return GasOptions.getGasOptions(options.chainId)
            if (chainId === ChainId.Astar) return await AstarGas.getGasOptions()
            return await DeBankGasOption.getGasOptions(options.chainId)
        } catch (error) {
            return GasOptions.getGasOptions(options.chainId)
        }
    }

    async getTransactions(
        chainId: ChainId,
        account: string,
        initial?: HubOptions,
    ): Promise<Pageable<Web3Transaction<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill({
            ...initial,
            account,
            chainId,
        })
        return attemptUntil(
            [DeBankHistory, Zerion].map((x) => () => x.getTransactions(options.account, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }
}
