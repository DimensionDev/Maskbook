import { useMemo } from 'react'
import { type NetworkPluginID, pageableToIterator } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useTransactions<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: NetworkPluginID,
    options?: HubOptions<T>,
) {
    const { account, chainId } = useChainContext()
    const Hub = useWeb3Hub(pluginID, options)

    return useMemo(() => {
        return pageableToIterator(
            async (indicator) => {
                return Hub.getTransactions(options?.chainId ?? chainId, options?.account ?? account, {
                    indicator,
                })
            },
            { maxSize: 999 },
        )
    }, [account, chainId, Hub, options?.chainId, options?.account])
}
