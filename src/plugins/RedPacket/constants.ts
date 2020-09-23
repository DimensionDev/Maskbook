import { ChainId } from '../../web3/types'

/** DON'T CHANGE IT. */
export const RedPacketMetaKey = 'com.maskbook.red_packet:1'
export const RedPacketPluginID = 'com.maskbook.redpacket'

export const RED_PACKET_CONSTANTS = {
    HAPPY_RED_PACKET_ADDRESS: {
        [ChainId.Mainnet]: '0x26760783c12181efa3c435aee4ae686c53bdddbb',
        [ChainId.Ropsten]: '0x26760783c12181efa3c435aee4ae686c53bdddbb',
        [ChainId.Rinkeby]: '0x575f906db24154977c7361c2319e2b25e897e3b6',
        [ChainId.Kovan]: '',
    },
}
export const RED_PACKET_HISTORY_URL = 'https://service.maskbook.com/red-packet-history'
