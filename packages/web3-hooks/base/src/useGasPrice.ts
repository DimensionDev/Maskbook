import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import { GasOptionType } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Connection } from './useWeb3Connection.js'
import { useGasOption } from './useGasOption.js'

export function useGasPrice<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const connection = useWeb3Connection(pluginID, options)
    const gasOption = useGasOption(pluginID, GasOptionType.NORMAL)
    const gasPrice = useAsyncRetry(async () => {
        if (!connection) return '0'
        return connection.getGasPrice() ?? '0'
    }, [connection])

    return useMemo(() => {
        return {
            ...gasPrice,
            value: gasOption?.value?.suggestedMaxFeePerGas ?? gasPrice.value,
        }
    }, [gasPrice, gasOption])
}
