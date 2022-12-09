/// <reference types="web3" />
import { useMemo } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3State } from './useWeb3State.js'

export function useWeb3<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    const { Connection, Others } = useWeb3State(pluginID)
    const { account, chainId, providerType } = useChainContext()

    const web3 = useMemo(() => {
        if (!Others?.isValidAddress(account) || !Others?.isValidChainId(chainId)) return
        return Connection?.getWeb3?.({
            account,
            chainId,
            providerType,
            ...options,
        })
    }, [account, chainId, providerType, JSON.stringify(options)])

    return web3 as Web3Helper.Web3Scope<S, T> | null
}
