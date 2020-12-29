import { ChainId } from '../../web3/types'

export const ITO_MetaKey = 'com.maskbook.ito:1'
export const ITO_PluginID = 'com.maskbook.ito'

export const ITO_EXCHANGE_RATION_MAX = 4

export const ITO_CONSTANTS = {
    ITO_CONTRACT_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '0x68fF49cf71c2207EA3D80600e59F00441F753Be8',
        [ChainId.Rinkeby]: '0x2B922CC664b23c5D1A2FA05cd69083c1D91b6c2C',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
}

export const ITO_CONTRACT_BASE_DATE = new Date(2020, 11, 1, 8, 0, 0, 0)

export const ITO_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/dimensiondev/mask-ito'
