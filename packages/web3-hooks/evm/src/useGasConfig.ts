import { useMemo, useState } from 'react'
import type { GasOptionConfig } from '@masknet/web3-shared-evm'
import { GasOptionType, toFixed } from '@masknet/web3-shared-base'
import { useGasOptions, useWeb3State } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useGasConfig(chainId: Web3Helper.ChainIdAll) {
    const [gasConfig, setGasConfig] = useState<GasOptionConfig | undefined>()
    const { Others } = useWeb3State()
    const isEIP1559 = Others?.chainResolver.isSupport(chainId, 'EIP1559')

    const { value: gasOptions_ } = useGasOptions()

    const gasPrice = useMemo(() => {
        try {
            const maxFeePerGas = toFixed(gasOptions_?.[GasOptionType.NORMAL]?.suggestedMaxFeePerGas ?? 0, 0)
            const maxPriorityFeePerGas = toFixed(
                gasOptions_?.[GasOptionType.NORMAL]?.suggestedMaxPriorityFeePerGas ?? 0,
                0,
            )

            setGasConfig(
                isEIP1559
                    ? {
                          maxFeePerGas,
                          maxPriorityFeePerGas,
                      }
                    : {
                          gasPrice: maxFeePerGas,
                      },
            )
            return maxFeePerGas
        } catch (err) {
            setGasConfig(undefined)
            return
        }
    }, [chainId, gasOptions_])

    return { gasPrice, gasConfig, setGasConfig }
}
