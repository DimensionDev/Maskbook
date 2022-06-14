import { useEffect, useState } from 'react'
import { createContainer } from 'unstated-next'
import { ChainId } from '@masknet/web3-shared-evm'

function useTargetChainId(chainId: ChainId = ChainId.Mainnet) {
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
