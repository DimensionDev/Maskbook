import { NetworkPluginID } from '@masknet/shared-base'
import { useGasOptions, useWeb3Utils } from '@masknet/web3-hooks-base'
import { GasOptionType } from '@masknet/web3-shared-base'
import type { ChainId, GasConfig } from '@masknet/web3-shared-evm'

export function useDefaultGasConfig(chainId: ChainId, gasLimit: string): GasConfig | undefined {
    const Utils = useWeb3Utils()
    const isSupportEIP1559 = Utils.chainResolver.isFeatureSupported(chainId, 'EIP1559')
    const { data: gasOptions } = useGasOptions(NetworkPluginID.PLUGIN_EVM, { chainId }, true)

    const gasOption = gasOptions?.[GasOptionType.SLOW]

    if (!gasOption) return
    return isSupportEIP1559 ?
            {
                gasOptionType: GasOptionType.SLOW,
                gas: gasLimit,
                maxFeePerGas: gasOption.suggestedMaxFeePerGas,
                maxPriorityFeePerGas: gasOption.suggestedMaxPriorityFeePerGas,
            }
        :   {
                gasOptionType: GasOptionType.SLOW,
                gas: gasLimit,
                gasPrice: gasOption.suggestedMaxFeePerGas,
            }
}
