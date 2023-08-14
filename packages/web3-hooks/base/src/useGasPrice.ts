import type { NetworkPluginID } from '@masknet/shared-base'
import { GasOptionType } from '@masknet/web3-shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useWeb3Connection } from './useWeb3Connection.js'
import { useGasOption } from './useGasOption.js'
import { useQuery } from '@tanstack/react-query'

export function useGasPrice<T extends NetworkPluginID = NetworkPluginID>(pluginID?: T, options?: ConnectionOptions<T>) {
    const Web3 = useWeb3Connection(pluginID, options)
    const gasOption = useGasOption(pluginID, GasOptionType.NORMAL)
    const gasPrice = useQuery(['get-gas-price', pluginID, options], async () => {
        return Web3.getGasPrice()
    })

    return {
        ...gasPrice,
        data: gasOption?.value?.suggestedMaxFeePerGas ?? gasPrice.data,
    }
}
