import {
    useChainId,
    useChainIdValid,
    useCurrentWeb3NetworkPluginID,
    useDefaultChainId,
} from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useEffect, useState } from 'react'
import { createContainer } from 'unstated-next'

function useTargetChainId() {
    const [expectedPluginId, setExpectedPluginId] = useState<NetworkPluginID>(NetworkPluginID.PLUGIN_EVM)
    const pluginId = useCurrentWeb3NetworkPluginID(expectedPluginId)
    const chainId = useChainId(pluginId)
    const [targetChainId, setTargetChainId] = useState<number>(chainId)
    const chainIdValid = useChainIdValid(pluginId)
    const defaultChainId = useDefaultChainId(pluginId)

    useEffect(() => {
        setTargetChainId(chainIdValid ? chainId : defaultChainId)
    }, [chainId, chainIdValid, defaultChainId])

    return {
        pluginId,
        setPluginId: setExpectedPluginId,
        targetChainId,
        setTargetChainId,
    }
}

export const TargetRuntimeContext = createContainer(useTargetChainId)
