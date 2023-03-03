import type { NetworkPluginID } from '@masknet/shared-base'
import {
    useAccount,
    useChainId,
    useDefaultChainId,
    useNetworkContext,
    Web3ContextProvider,
} from '@masknet/web3-hooks-base'
import { type FC, type PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { createContainer } from 'unstated-next'

function useTargetRuntime(initPluginID?: NetworkPluginID) {
    const { pluginID } = useNetworkContext(initPluginID)
    const [targetPluginID, setTargetPluginID] = useState<NetworkPluginID>(pluginID)

    const [chainIdMap, setChainIdMap] = useState<Partial<Record<NetworkPluginID, number>>>({})
    const defaultChainId = useDefaultChainId(targetPluginID)
    const targetChainId = chainIdMap[targetPluginID] ?? defaultChainId
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

export const ChainRuntime: FC<PropsWithChildren<{}>> = ({ children }) => {
    const { targetPluginID, setTargetChainId } = TargetRuntimeContext.useContainer()
    const defaultChainId = useDefaultChainId(targetPluginID)
    const chainId = useChainId(targetPluginID) || defaultChainId
    const account = useAccount(targetPluginID)

    useEffect(() => {
        setTargetChainId(chainId)
    }, [chainId, setTargetChainId])

    return <Web3ContextProvider value={{ pluginID: targetPluginID, chainId, account }}>{children}</Web3ContextProvider>
}
