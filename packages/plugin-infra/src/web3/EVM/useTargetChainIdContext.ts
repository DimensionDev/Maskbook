import { useState } from 'react'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { createContainer } from 'unstated-next'
import { useChainId } from '../useChainId'

export function useTargetChainIdContext(_chainId?: ChainId) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM, _chainId)
    const [targetChainId, setTargetChainId] = useState<ChainId>(_chainId ?? chainId)

    return {
        targetChainId,
        setTargetChainId,
    }
}

export const TargetChainIdContext = createContainer(useTargetChainIdContext)
