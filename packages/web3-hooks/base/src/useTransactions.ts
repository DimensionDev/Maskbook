import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'
import { pageableToIterator } from '@masknet/web3-shared-base'
import { useMemo } from 'react'

export function useTransactions<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: NetworkPluginID,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const { account, chainId } = useChainContext()
    const hub = useWeb3Hub(pluginID, options)
    return useMemo(() => {
        return pageableToIterator(async (indicator) => {
            return hub?.getTransactions(options?.chainId ?? chainId, options?.account ?? account, {
                indicator,
            })
        })
    }, [account, chainId, hub])
}
