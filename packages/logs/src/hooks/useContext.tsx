import React, { createContext, useContext, useMemo } from 'react'
import type { LoggerAPI } from '@masknet/web3-providers/types'
import { useNetworkContext, useChainContext, useProviderType, useNetworkType } from '@masknet/web3-hooks-base'

const LogContext = createContext<LoggerAPI.CommonOptions>(null!)
LogContext.displayName = 'LogContext'

export function LogContextProvider({ value, children }: React.ProviderProps<LoggerAPI.CommonOptions>) {
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext()
    const networkType = useNetworkType()
    const providerType = useProviderType()

    const options = useMemo<LoggerAPI.CommonOptions>(() => {
        return {
            device: {
                ...value.device,
            },
            network: {
                chainId,
                networkID: pluginID,
                networkType,
                providerType,
                ...value.network,
            },
            user: {
                account,
                ...value.user,
            },
        }
    }, [pluginID, account, chainId, JSON.stringify(value)])

    return (
        <LogContext.Provider value={options}>
            {children}
        </LogContext.Provider>
    )
}

export function useLogContext() {
    const context = useContext(LogContext)
    return context
}