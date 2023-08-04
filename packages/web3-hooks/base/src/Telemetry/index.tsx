import { createContext, useContext, useMemo, type ProviderProps } from 'react'
import type { CommonOptions } from '@masknet/web3-telemetry/types'
import { useChainContext, useNetworkContext } from '../useContext.js'
import { useProviderType } from '../useProviderType.js'

const Telemetry = createContext<CommonOptions>(null!)
Telemetry.displayName = 'TelemetryContext'

export function TelemetryProvider({ value, children }: Partial<ProviderProps<CommonOptions>>) {
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext()

    const providerType = useProviderType()

    const options = useMemo<CommonOptions>(() => {
        return {
            device: {
                ...value?.device,
            },
            network: {
                chainId,
                networkID: pluginID,
                providerType,
                ...value?.network,
            },
            user: {
                account,
                ...value?.user,
            },
        }
    }, [pluginID, account, chainId, providerType, JSON.stringify(value)])

    return <Telemetry.Provider value={options}>{children}</Telemetry.Provider>
}

export function useTelemetryContext() {
    return useContext(Telemetry)
}
