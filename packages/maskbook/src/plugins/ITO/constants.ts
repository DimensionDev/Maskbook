import { ChainId } from '../../web3/types'

export const pluginName = 'ITO'
export const identifier = 'com.maskbook.ITO'
export const ITOPluginID = 'maskbook.ITO'
export const ITOMetaKey = 'com.maskbook.meta.ITO:1'

export const ITO_CONSTANTS = {
    HAPPY_ITO_ADDRESS: {
        [ChainId.Mainnet]: '0x26760783c12181efa3c435aee4ae686c53bdddbb',
        [ChainId.Ropsten]: '0x26760783c12181efa3c435aee4ae686c53bdddbb',
        [ChainId.Rinkeby]: '0x575f906db24154977c7361c2319e2b25e897e3b6',
        [ChainId.Kovan]: '',
    },
}

export const ITO_RATIO_MIN = 1
export const ITO_ALLOCATION_PER_WALLET_MIN = 1
