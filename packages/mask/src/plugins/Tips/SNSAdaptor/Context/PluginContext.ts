import { useEffect, useState } from 'react'
import { createContainer } from 'unstated-next'
import { useAccount, useChainId, useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'

function usePluginContext() {
    const pluginID = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId()
    const account = useAccount()
    const [targetChainId, setTargetChainId] = useState(chainId)

    useEffect(() => {
        setTargetChainId(chainId)
    }, [chainId])

    return {
        pluginID,
        account,
        chainId,

        targetChainId,
        setTargetChainId,
    }
}

export const PluginContext = createContainer(usePluginContext)
