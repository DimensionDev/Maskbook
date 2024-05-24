import type { NetworkPluginID } from '@masknet/shared-base'
import {
    useAccount,
    useChainContext,
    useDefaultChainId,
    useNetworkContext,
    Web3ContextProvider,
} from '@masknet/web3-hooks-base'
import { type PropsWithChildren, useCallback, useState } from 'react'
import { createContainer } from '@masknet/shared-base-ui'

function useTargetRuntime(initPluginID?: NetworkPluginID) {
    const { pluginID } = useNetworkContext()
    const [targetPluginID, setTargetPluginID] = useState<NetworkPluginID>(initPluginID ?? pluginID)

    const [chainIdMap, setChainIdMap] = useState<Partial<Record<NetworkPluginID, number>>>({})

    const { chainId } = useChainContext()
    const defaultChainId = useDefaultChainId(targetPluginID)
    const fallbackChainId = targetPluginID === pluginID ? chainId : defaultChainId
    const targetChainId = chainIdMap[targetPluginID] ?? fallbackChainId
    const setTargetChainId = useCallback(
        (id: number) => {
            setChainIdMap((map) => ({ ...map, [targetPluginID]: id }))
        },
        [targetPluginID],
    )

    return {
        targetPluginID,
        setTargetPluginID,
        targetChainId,
        setTargetChainId,
    }
}

export const TargetRuntimeContext = createContainer(useTargetRuntime)
TargetRuntimeContext.Provider.displayName = 'TargetRuntimeContextProvider'

/**
 * A Tips scoped chain runtime, which controls Web3ContextProvider value
 */
export function ChainRuntime({ children }: PropsWithChildren) {
    const { targetPluginID, targetChainId } = TargetRuntimeContext.useContainer()
    const account = useAccount(targetPluginID)

    return (
        <Web3ContextProvider network={targetPluginID} chainId={targetChainId} account={account} controlled>
            {children}
        </Web3ContextProvider>
    )
}
