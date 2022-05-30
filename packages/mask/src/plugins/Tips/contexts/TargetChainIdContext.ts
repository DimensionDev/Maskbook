import { useEffect, useState } from 'react'
import { createContainer } from 'unstated-next'
import type { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId } from '@masknet/plugin-infra/web3'

function useTargetChainId() {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [targetChainId, setTargetChainId] = useState<ChainId>(chainId)

    useEffect(() => {
        setTargetChainId(chainId)
    }, [chainId])

    return {
        targetChainId,
        setTargetChainId,
    }
}

export const TargetChainIdContext = createContainer(useTargetChainId)
