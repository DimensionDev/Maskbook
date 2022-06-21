import { useState } from 'react'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { createContainer } from 'unstated-next'
import { useChainId } from '../useChainId'

export function useTargetChainIdContext(_targetChainId: ChainId = ChainId.Mainnet) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [targetChainId, setTargetChainId] = useState<ChainId>(_targetChainId ?? chainId)

    return {
        targetChainId,
        setTargetChainId,
    }
}

export const TargetChainIdContext = createContainer(useTargetChainIdContext)
