import { useChainId, useCurrentWeb3NetworkPluginID, Web3Helper } from '@masknet/plugin-infra/web3'
import { useEffect, useState } from 'react'
import { createContainer } from 'unstated-next'

function useTargetChainId() {
    const pluginId = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId()
    const [targetChainId, setTargetChainId] = useState<Web3Helper.ChainIdAll>(chainId)

    useEffect(() => {
        setTargetChainId(chainId)
    }, [chainId])

    return {
        pluginId,
        targetChainId,
        setTargetChainId,
    }
}

export const TargetRuntimeContext = createContainer(useTargetChainId)
