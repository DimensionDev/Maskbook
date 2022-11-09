import * as fcl from '@blocto/fcl'
import type { ChainId } from '../types.js'
import { getAuthConstants } from '../constants/index.js'

export function createClient(chainId: ChainId) {
    const authConstants = getAuthConstants(chainId)

    fcl.config({
        'accessNode.api': authConstants.ACCESS_NODE_API ?? '',
        'app.detail.title': authConstants.MASK_APP_TITLE,
        'app.detail.icon': authConstants.MASK_APP_ICON,
        // @ts-ignore
        'challenge.handshake': authConstants.CHALLENGE_HANDSHAKE ?? '',
        'discovery.wallet.method': 'HTTP/POST',
    })
    return fcl
}
