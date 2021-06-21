import { ChainId } from '@dimensiondev/web3-shared'

/**
 * !! Change this key cause a breaking change in the red packet plugin.
 * !! Please make sure it also be able to recognize the old key.
 */
export const RedPacketMetaKey = 'com.maskbook.red_packet:1'
/**
 * !! This ID is used to identify the stored plugin data. Change it will cause data lost.
 */
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
        [ChainId.Mainnet]: '0x8D8912E1237F9FF3EF661F32743CFB276E052F98',
        [ChainId.Ropsten]: '0x2E37676de88aD97f2BdBAa24d1421b4E3f3a63c8',
        [ChainId.Rinkeby]: '0x575f906db24154977c7361c2319e2b25e897e3b6',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    HAPPY_RED_PACKET_ADDRESS_V3: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '0x71834a3FDeA3E70F14a93ED85c6be70925D0CAd9',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '0x913975af2bb8a6be4100d7dc5e9765b77f6a5d6c',
        [ChainId.Mumbai]: '0x0061E06c9f640a03C4981f43762d2AE5e03873c5',
    },
    SUBGRAPH_URL: {
        [ChainId.Mainnet]: 'https://api.thegraph.com/subgraphs/name/dimensiondev/mask-red-packet-mainnet',
        [ChainId.Ropsten]: 'https://api.thegraph.com/subgraphs/name/dimensiondev/mask-red-packet-ropsten',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: 'https://api.thegraph.com/subgraphs/name/dimensiondev/mask-red-packet-bsc-mainnet',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: 'https://api.thegraph.com/subgraphs/name/dimensiondev/mask-red-packet-polygon',
        [ChainId.Mumbai]: 'https://api.thegraph.com/subgraphs/name/dimensiondev/mask-red-packet-mumbai',
    },
}

export const RED_PACKET_DEFAULT_SHARES = 5
export const RED_PACKET_MIN_SHARES = 1
export const RED_PACKET_MAX_SHARES = 999

export const RED_PACKET_HISTORY_URL = 'https://service.r2d2.to/red-packet-history'
export const RED_PACKET_HISTROY_MAX_BLOCK_SIZE = Math.floor(
    (30 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60) /* seconds */ / 15 /* each block in seconds */,
)
