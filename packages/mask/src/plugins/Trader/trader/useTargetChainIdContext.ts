import { ChainId, useChainId } from '../../../../../web3-shared/evm'
import { useState } from 'react'
import { createContainer } from 'unstated-next'

export function useTargetChainIdContext() {
    const chainId = useChainId()
    const [targetChainId, setTargetChainId] = useState<ChainId>(chainId)

    return {
        targetChainId,
        setTargetChainId,
    }
}

export const TargetChainIdContext = createContainer(useTargetChainIdContext)
