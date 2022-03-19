import { NetworkPluginID, useChainId } from '@masknet/plugin-infra'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useState } from 'react'
import { createContainer } from 'unstated-next'

function useTargetChainId() {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [targetChainId, setTargetChainId] = useState<ChainId>(chainId)

    return {
        targetChainId,
        setTargetChainId,
    }
}

export const TargetChainIdContext = createContainer(useTargetChainId)
