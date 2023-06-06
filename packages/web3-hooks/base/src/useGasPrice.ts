import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import { GasOptionType } from '@masknet/web3-shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useWeb3Connection } from './useWeb3Connection.js'
import { useGasOption } from './useGasOption.js'

export function useGasPrice<T extends NetworkPluginID = NetworkPluginID>(pluginID?: T, options?: ConnectionOptions<T>) {
    const Web3 = useWeb3Connection(pluginID, options)
    const gasOption = useGasOption(pluginID, GasOptionType.NORMAL)
    const gasPrice = useAsyncRetry(async () => {
        return Web3.getGasPrice()
    }, [Web3])

    return useMemo(() => {
        return {
            ...gasPrice,
            value: gasOption.value?.suggestedMaxFeePerGas ?? gasPrice.value,
        }
    }, [gasPrice, gasOption])
}
