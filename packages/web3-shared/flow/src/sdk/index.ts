import * as fcl from /* webpackDefer: true */ '@blocto/fcl'
import type { ChainId } from '../types.js'
import { getAuthConstants } from '../constants/constants.js'

export function createClient(chainId: ChainId) {
    const authConstants = getAuthConstants(chainId)

    fcl.config({
        'flow.network': 'mainnet',
        'accessNode.api': authConstants.ACCESS_NODE_API!,
        'discovery.wallet': authConstants.DISCOVERY_WALLET!,
        'app.detail.title': authConstants.MASK_APP_TITLE,
        'app.detail.icon': authConstants.MASK_APP_ICON,
    })
    return fcl
}
