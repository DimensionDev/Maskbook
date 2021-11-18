import { useMemo } from 'react'
import * as fcl from '@onflow/fcl'
import { useAuthConstants } from '../constants'
import { useChainId } from '.'

export function useFCL() {
    const chainId = useChainId()
    const authConstants = useAuthConstants(chainId)
    return useMemo(() => {
        fcl.config({
            'accessNode.api': authConstants.ACCESS_NODE_API,
            'app.detail.title': 'Mask Network',
            'app.detail.icon':
                'https://dimensiondev.github.io/Maskbook-VI/assets/Logo/MB--Logo--Geo--ForceCircle--Blue.svg',
            'challenge.handshake': authConstants.CHALLENGE_HANDSHAKE,
        })
        return fcl
    }, [authConstants])
}
