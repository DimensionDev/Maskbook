import { useState } from 'react'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useChainId, NetworkPluginID } from '@masknet/plugin-infra'
import { createContainer } from 'unstated-next'

export function useTargetChainIdContext() {
    const chainId = useChainId<ChainId>(NetworkPluginID.PLUGIN_EVM)
    const [targetChainId, setTargetChainId] = useState<ChainId>(chainId)

    return {
        targetChainId,
        setTargetChainId,
    }
}

export const TargetChainIdContext = createContainer(useTargetChainIdContext)
