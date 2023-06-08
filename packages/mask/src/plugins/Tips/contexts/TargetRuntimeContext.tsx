import type { NetworkPluginID } from '@masknet/shared-base'
import {
    useAccount,
    useChainContext,
    useDefaultChainId,
    useNetworkContext,
    Web3ContextProvider,
} from '@masknet/web3-hooks-base'
import { type FC, type PropsWithChildren, useCallback, useState, useMemo } from 'react'
import { createContainer } from 'unstated-next'

function useTargetRuntime(initPluginID?: NetworkPluginID) {
    const { pluginID } = useNetworkContext(initPluginID)
    const [targetPluginID, setTargetPluginID] = useState<NetworkPluginID>(pluginID)

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

/**
 * A Tips scoped chain runtime, which controls Web3ContextProvider value
 */
export const ChainRuntime: FC<PropsWithChildren<{}>> = ({ children }) => {
    const { targetPluginID, targetChainId } = TargetRuntimeContext.useContainer()
    const account = useAccount(targetPluginID)

    const context = useMemo(() => {
        return {
            pluginID: targetPluginID,
            chainId: targetChainId,
            account,
            controlled: true,
        }
    }, [targetPluginID, targetChainId, account])

    return <Web3ContextProvider value={context}>{children}</Web3ContextProvider>
}
