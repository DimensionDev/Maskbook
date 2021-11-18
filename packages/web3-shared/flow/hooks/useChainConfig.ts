import { useMemo } from 'react'
import type { ChainId } from '../types'
import { useAuthConstants } from '../constants'

export function useChainConfig(chainId: ChainId) {
    const authConstants = useAuthConstants(chainId)

    return useMemo(() => {
        return {
            'accessNode.api': authConstants.ACCESS_NODE_API,
            'discovery.wallet': authConstants.DISCOVERY_WALLET,
        }
    }, [authConstants])
}
