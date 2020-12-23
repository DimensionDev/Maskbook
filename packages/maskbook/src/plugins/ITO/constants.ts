import { ChainId } from '../../web3/types'

export const ITO_MetaKey = 'com.maskbook.ito:1'
export const ITO_PluginID = 'com.maskbook.ito'

export const ITO_EXCHANGE_RATION_MAX = 4

export const ITO_CONSTANTS = {
    ITO_CONTRACT_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '0xdb1eec6fecc708139aae82f0a4db0385968565c5',
        [ChainId.Rinkeby]: '0xb190b2532b1cecee072f51c699c1dfd3888f3bb0',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
}

export const ITO_CONTRACT_BASE_DATE = new Date(2020, 11, 1, 8, 0, 0, 0)

export const THEGRAPH_MASK_ITO = 'https://api.thegraph.com/subgraphs/name/dimensiondev/mask-ito'
