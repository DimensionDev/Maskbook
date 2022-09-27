import { useMemo } from 'react'
import { GasOptionType, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useGasOptions } from './useGasOptions.js'

export function useGasOption<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    optionType?: GasOptionType,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const gasOptions = useGasOptions(pluginID, options)
    return useMemo(() => {
        return {
            ...gasOptions,
            value: gasOptions.value?.[optionType ?? GasOptionType.NORMAL],
        }
    }, [gasOptions, optionType])
}
