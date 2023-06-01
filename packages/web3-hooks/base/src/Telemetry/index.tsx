import React, { createContext, useContext, useMemo } from 'react'
import type { CommonOptions } from '@masknet/web3-telemetry/types'
import { useChainContext, useNetworkContext } from '../useContext.js'
import { useNetworkType } from '../useNetworkType.js'
import { useProviderType } from '../useProviderType.js'

const Telemetry = createContext<CommonOptions>(null!)
Telemetry.displayName = 'TelemetryContext'

export function TelemetryProvider({ value, children }: Partial<React.ProviderProps<CommonOptions>>) {
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext()

    const networkType = useNetworkType()
    const providerType = useProviderType()

    const options = useMemo<CommonOptions>(() => {
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
