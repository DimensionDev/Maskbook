import { ChainId, useChainId } from '@masknet/web3-shared-evm'
import { useEffect, useState } from 'react'
import { createContainer } from 'unstated-next'

function useTargetChainId() {
    const chainId = useChainId()
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
