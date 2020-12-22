import { ChainId } from '../../web3/types'

export const ITO_MetaKey = 'com.maskbook.ito:1'
export const ITO_PluginID = 'com.maskbook.ito'

export const ITO_EXCHANGE_RATION_MAX = 4

export const ITO_CONSTANTS = {
    ITO_CONTRACT_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '0x3c4bcbbeba90f1bafcc447163fd0367d4591875c',
        [ChainId.Rinkeby]: '0x94d40a59c653574db0397000fa9a0e83e86481a1',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
}

export const ITO_CONTRACT_BASE_DATE = new Date(2020, 11, 1, 8, 0, 0, 0)
