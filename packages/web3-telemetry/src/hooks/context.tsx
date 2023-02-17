import React, { createContext, useContext, useMemo } from 'react'
import type { TelemetryAPI } from '@masknet/web3-providers/types'
import { useNetworkContext, useChainContext, useProviderType, useNetworkType } from '@masknet/web3-hooks-base'

const Telemetry = createContext<TelemetryAPI.CommonOptions>(null!)
Telemetry.displayName = 'TelemetryContext'

export function TelemetryProvider({ value, children }: Partial<React.ProviderProps<TelemetryAPI.CommonOptions>>) {
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext()

    const networkType = useNetworkType()
    const providerType = useProviderType()

    const options = useMemo<TelemetryAPI.CommonOptions>(() => {
        return {
            device: {
                ...value?.device,
            },
            network: {
                chainId,
                networkID: pluginID,
                networkType,
                providerType,
                ...value?.network,
            },
            user: {
                account,
                ...value?.user,
            },
        }
    }, [pluginID, account, chainId, networkType, providerType, JSON.stringify(value)])

    return <Telemetry.Provider value={options}>{children}</Telemetry.Provider>
}

export function useTelemetryContext() {
    return useContext(Telemetry)
}
