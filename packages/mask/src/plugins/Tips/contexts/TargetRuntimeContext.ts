import { useEffect, useState } from 'react'
import { createContainer } from 'unstated-next'
import { useChainId, useChainIdValid, useDefaultChainId, useNetworkContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'

function useTargetChainId() {
    const [expectedPluginID, setExpectedPluginID] = useState<NetworkPluginID>(NetworkPluginID.PLUGIN_EVM)
    const { pluginID } = useNetworkContext(expectedPluginID)
    const chainId = useChainId(pluginID)
    const [targetChainId, setTargetChainId] = useState<number>(chainId)
    const chainIdValid = useChainIdValid(pluginID)
    const defaultChainId = useDefaultChainId(pluginID)

    useEffect(() => {
        setTargetChainId(chainIdValid ? chainId : defaultChainId)
    }, [chainId, chainIdValid, defaultChainId])

    return {
        pluginID,
        setPluginID: setExpectedPluginID,
        targetChainId,
        setTargetChainId,
    }
}

export const TargetRuntimeContext = createContainer(useTargetChainId)
