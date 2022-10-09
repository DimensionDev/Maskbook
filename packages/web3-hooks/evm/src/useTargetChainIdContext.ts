import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { NetworkPluginID } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useChainId } from '@masknet/web3-hooks-base'

export function useTargetChainIdContext(_chainId?: ChainId) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM, _chainId)
    const [targetChainId, setTargetChainId] = useState<ChainId>(chainId)

    return {
        targetChainId,
        setTargetChainId,
    }
}

export const TargetChainIdContext = createContainer(useTargetChainIdContext)
