import { useState } from 'react'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { createContainer } from 'unstated-next'
import { useChainId } from '@masknet/plugin-infra/web3'

export function useTargetChainIdContext() {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [targetChainId, setTargetChainId] = useState<ChainId>(chainId)

    return {
        targetChainId,
        setTargetChainId,
    }
}

export const TargetChainIdContext = createContainer(useTargetChainIdContext)
