import { useState } from 'react'
import { useAsync } from 'react-use'
import { GasOptionConfig, formatGweiToWei, ChainId } from '@masknet/web3-shared-evm'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

// TODO: support multiple chain
export function useGasConfig(chainId: ChainId) {
    const [gasConfig, setGasConfig] = useState<GasOptionConfig | undefined>()
    const { GasOptions } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { value: gasPrice } = useAsync(async () => {
        try {
            const response = await GasOptions?.getGasOptions?.(chainId)
            const maxFeePerGas = formatGweiToWei(response?.normal?.suggestedMaxFeePerGas ?? 0).toFixed(0)
            const maxPriorityFeePerGas = formatGweiToWei(response?.normal?.suggestedMaxPriorityFeePerGas ?? 0).toFixed(
                0,
            )

            setGasConfig({
                maxFeePerGas,
                maxPriorityFeePerGas,
            })
            return maxFeePerGas
        } catch (err) {
            setGasConfig(undefined)
            return
        }
    }, [chainId])

    return { gasPrice, gasConfig, setGasConfig }
}
