import { ChainId } from '@dimensiondev/web3-shared'

/** DON'T CHANGE IT. */
export const RedPacketMetaKey = 'com.maskbook.red_packet:1'
export const RedPacketPluginID = 'com.maskbook.red_packet'

export const RED_PACKET_CONSTANTS = {
    HAPPY_RED_PACKET_ADDRESS_V1: {
        [ChainId.Mainnet]: '0x26760783c12181efa3c435aee4ae686c53bdddbb',
        [ChainId.Ropsten]: '0x6d84e4863c0530bc0bb4291ef0ff454a40660ca3',
        [ChainId.Rinkeby]: '0x575f906db24154977c7361c2319e2b25e897e3b6',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    HAPPY_RED_PACKET_ADDRESS_V2: {
        [ChainId.Mainnet]: '0x26760783c12181efa3c435aee4ae686c53bdddbb',
        [ChainId.Ropsten]: '0x6d84e4863c0530bc0bb4291ef0ff454a40660ca3',
        [ChainId.Rinkeby]: '0x575f906db24154977c7361c2319e2b25e897e3b6',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '0x6cc1b1058F9153358278C35E0b2D382f1585854B',
        [ChainId.BSCT]: '0x8440b99B1Df5D4B61957c8Ce0a199487Be3De270',
        [ChainId.Matic]: '0x71834a3FDeA3E70F14a93ED85c6be70925D0CAd9',
        [ChainId.Mumbai]: '0x6DfC82B48CFd38d4722366Cd6F444a341b8840f5',
    },
    SUBGRAPH_URL: {
        [ChainId.Mainnet]: 'https://api.thegraph.com/subgraphs/name/dimensiondev/mask-red-packet',
        [ChainId.Ropsten]: 'https://api.thegraph.com/subgraphs/name/dimensiondev/mask-red-packet-ropsten',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
}

export const RED_PACKET_CONTRACT_VERSION = 2

export const RED_PACKET_DEFAULT_SHARES = 5
export const RED_PACKET_MIN_SHARES = 1
export const RED_PACKET_MAX_SHARES = 999

export const RED_PACKET_HISTORY_URL = 'https://service.r2d2.to/red-packet-history'
export const RED_PACKET_HISTROY_MAX_BLOCK_SIZE = Math.floor(
    (30 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60) /* seconds */ / 15 /* each block in seconds */,
)
