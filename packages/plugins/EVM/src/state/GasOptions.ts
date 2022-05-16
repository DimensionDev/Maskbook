import type { Plugin } from '@masknet/plugin-infra'
import { DeBank, MetaSwap } from '@masknet/web3-providers'
import type {
    CurrencyType,
    GasOptions as GasOptionsType,
    GasOptionsState as Web3GasOptionsState,
} from '@masknet/web3-shared-base'
import { ChainId, chainResolver } from '@masknet/web3-shared-evm'

export class GasOptions implements Web3GasOptionsState<ChainId> {
    constructor(protected context: Plugin.Shared.SharedContext) {}

    getGasOptions(chainId: ChainId, currencyType?: CurrencyType | undefined): Promise<GasOptionsType> {
        if (chainResolver.isSupport(chainId, 'EIP1559')) {
            return MetaSwap.getGasOptions(chainId)
        }
        return DeBank.getGasOptions(chainId)
    }
}
