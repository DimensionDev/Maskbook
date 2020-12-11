import { ChainId } from '../../web3/types'

export const ITO_MetaKey = 'com.maskbook.ito:1'
export const ITO_PluginID = 'com.maskbook.ito'

export const ITO_EXCHANGE_RATION_MAX = 4

export const ITO_CONSTANTS = {
    ITO_CONTRACT_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '0x52ceb31d6c197b5c039786fbefd6a82df70fdfd6',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
}

export const ITO_CONTRACT_BASE_DATE = new Date(1606780800000)
