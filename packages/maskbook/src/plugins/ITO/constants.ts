import { ChainId } from '../../web3/types'

export const ITO_MetaKey = 'com.maskbook.ito:1'
export const ITO_PluginID = 'com.maskbook.ito'

export const ITO_CONSTANTS = {
    ITO_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '0x643d411da56744950c6f9f47d75d58bc42623c11',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
}
