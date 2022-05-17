import type { Plugin } from '@masknet/plugin-infra'
import { DeBank, MetaSwap } from '@masknet/web3-providers'
import type { CurrencyType, GasOptionsState as Web3GasOptionsState, GasOptionType } from '@masknet/web3-shared-base'
import { ChainId, chainResolver, GasOption } from '@masknet/web3-shared-evm'

export class GasOptions implements Web3GasOptionsState<ChainId, GasOption> {
    constructor(protected context: Plugin.Shared.SharedContext) {}

    getGasOptions(
        chainId: ChainId,
        currencyType?: CurrencyType | undefined,
    ): Promise<Record<GasOptionType, GasOption>> {
        if (chainResolver.isSupport(chainId, 'EIP1559')) {
            return MetaSwap.getGasOptions(chainId)
        }
        return DeBank.getGasOptions(chainId)
    }
}
