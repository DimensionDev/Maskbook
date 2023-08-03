import { EMPTY_LIST } from '@masknet/shared-base'
import { attemptUntil, type Transaction as Web3Transaction } from '@masknet/web3-shared-base'
import { type Pageable, createPageable, createIndicator } from '@masknet/shared-base'
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
import { GasOptionAPI } from './GasOptionAPI.js'
import { HubOptionsAPI } from './HubOptionsAPI.js'
import type { HubOptions } from '../types/index.js'
import { MetaSwapAPI } from '../../../MetaSwap/index.js'
import { AstarAPI } from '../../../Astar/index.js'
import { DeBankGasOptionAPI, DeBankHistoryAPI } from '../../../DeBank/index.js'
import { ZerionAPI } from '../../../Zerion/index.js'

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
    private GasOptions = new GasOptionAPI()
    private MetaSwap = new MetaSwapAPI()
    private AstarGas = new AstarAPI()
    private DeBankGasOption = new DeBankGasOptionAPI()
    private DeBankHistory = new DeBankHistoryAPI()
    private Zerion = new ZerionAPI()

    protected override HubOptions = new HubOptionsAPI(this.options)

    override async getGasOptions(chainId: ChainId, initial?: HubOptions) {
        const options = this.HubOptions.fill({
            ...initial,
            chainId,
        })
        try {
            const isEIP1559 = ChainResolver.isFeatureSupported(options.chainId, 'EIP1559')
            if (isEIP1559 && chainId !== ChainId.Astar) return await this.MetaSwap.getGasOptions(options.chainId)
            if (chainId === ChainId.Astar) return await this.AstarGas.getGasOptions(options.chainId)
            return await this.DeBankGasOption.getGasOptions(options.chainId)
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
            [this.DeBankHistory, this.Zerion].map((x) => () => x.getTransactions(options.account, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }
}
