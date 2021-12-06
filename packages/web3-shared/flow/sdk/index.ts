import * as fcl from '@blocto/fcl'
import type { ChainId } from '../types'
import { getAuthConstants } from '../constants'

export function createClient(chainId: ChainId) {
    const authConstants = getAuthConstants(chainId)

    fcl.config({
        'accessNode.api': authConstants.ACCESS_NODE_API,
        'app.detail.title': authConstants.MASK_APP_TITLE,
        'app.detail.icon': authConstants.MASK_APP_ICON,
        'challenge.handshake': authConstants.CHALLENGE_HANDSHAKE,
        'discovery.wallet.method': 'HTTP/POST',
    })
    return fcl
}
