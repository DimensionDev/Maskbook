import { EMPTY_LIST } from '@masknet/shared-base'
import { MetaSwap, AstarGas, Zerion, DeBankGasOption, DeBankHistory } from '@masknet/web3-providers'
import { attemptUntil, type Transaction as Web3Transaction } from '@masknet/web3-shared-base'
import { type Pageable, createPageable, createIndicator } from '@masknet/shared-base'
import {
    ChainId,
    chainResolver,
    type GasOption,
    type SchemaType,
    type ProviderType,
    type NetworkType,
    type RequestArguments,
    type Transaction,
    type TransactionParameter,
} from '@masknet/web3-shared-evm'
import { HubBaseAPI_Base } from '../../Base/apis/HubBaseAPI.js'
import { GasOptionAPI } from './GasOptionAPI.js'
import { HubOptionsAPI } from './HubOptionsAPI.js'
import type { HubOptions } from '../types/index.js'

export class HubBaseAPI extends HubBaseAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    Transaction,
    TransactionParameter,
    GasOption
> {
    protected override HubOptions = new HubOptionsAPI(this.options)
    private GasOptions = new GasOptionAPI()

    override async getGasOptions(chainId: ChainId, initial?: HubOptions) {
        const options = this.HubOptions.fill({
            ...initial,
            chainId,
        })
        try {
            const isEIP1559 = chainResolver.isSupport(options.chainId, 'EIP1559')
            if (isEIP1559 && chainId !== ChainId.Astar) return await MetaSwap.getGasOptions(options.chainId)
            if (chainId === ChainId.Astar) return await AstarGas.getGasOptions(options.chainId)
            return await DeBankGasOption.getGasOptions(options.chainId)
        } catch (error) {
            return this.GasOptions.getGasOptions(options.chainId)
        }
    }

    override async getTransactions(
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
