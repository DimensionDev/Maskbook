import { useState } from 'react'
import { useAsync } from 'react-use'
import { GasOptionConfig, formatGweiToWei, ChainId } from '@masknet/web3-shared-evm'
import { GasOptionType, NetworkPluginID } from '@masknet/web3-shared-base'
import { useGasOptions } from '../useGasOptions'

// TODO: support multiple chain
export function useGasConfig(chainId: ChainId) {
    const [gasConfig, setGasConfig] = useState<GasOptionConfig | undefined>()
    const { value: gasOptions_ } = useGasOptions(NetworkPluginID.PLUGIN_EVM)
    const { value: gasPrice } = useAsync(async () => {
        try {
            const maxFeePerGas = formatGweiToWei(
                gasOptions_?.[GasOptionType.NORMAL]?.suggestedMaxFeePerGas ?? 0,
            ).toFixed(0)
            const maxPriorityFeePerGas = formatGweiToWei(
                gasOptions_?.[GasOptionType.NORMAL]?.suggestedMaxPriorityFeePerGas ?? 0,
            ).toFixed(0)

            setGasConfig({
                maxFeePerGas,
                maxPriorityFeePerGas,
            })
            return maxFeePerGas
        } catch (err) {
            setGasConfig(undefined)
            return
        }
    }, [chainId, gasOptions_])

    return { gasPrice, gasConfig, setGasConfig }
}
