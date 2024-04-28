import { useMemo } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import { GasOptionType } from '@masknet/web3-shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useGasOptions } from './useGasOptions.js'

export function useGasOption<T extends NetworkPluginID = NetworkPluginID>(
    pluginID: T,
    optionType: GasOptionType,
    options: HubOptions<T>,
) {
    const { data: gasOptions } = useGasOptions(pluginID, options)

    return useMemo(() => {
        return {
            ...gasOptions,
            value: gasOptions?.[optionType ?? GasOptionType.NORMAL],
        }
    }, [gasOptions, optionType])
}
