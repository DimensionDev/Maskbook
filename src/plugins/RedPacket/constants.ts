import { ChainId } from '../../web3/types'

/** DON'T CHANGE IT. */
export const RedPacketMetaKey = 'com.maskbook.red_packet:1'
export const RedPacketPluginID = 'com.maskbook.red_packet'

export const RED_PACKET_CONSTANTS = {
    HAPPY_RED_PACKET_ADDRESS: {
        [ChainId.Mainnet]: '0x26760783c12181efa3c435aee4ae686c53bdddbb',
        [ChainId.Ropsten]: '0x26760783c12181efa3c435aee4ae686c53bdddbb',
        [ChainId.Rinkeby]: '0x575f906db24154977c7361c2319e2b25e897e3b6',
        [ChainId.Kovan]: '',
    },
}

export const RED_PACKET_CONTRACT_VERSION = 1

export const RED_PACKET_DEFAULT_SHARES = 5
export const RED_PACKET_MIN_SHARES = 1
export const RED_PACKET_MAX_SHARES = 999

export const RED_PACKET_HISTORY_URL = 'https://service.maskbook.com/red-packet-history'
export const RED_PACKET_HISTROY_MAX_BLOCK_SIZE = Math.floor(
    (30 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60) /* seconds */ / 15 /* each block in seconds */,
)
