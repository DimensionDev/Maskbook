import { ChainId } from '../../web3/types'

export const COTM_MetaKey = 'com.maskbook.COTM:1'
export const COTM_PluginID = 'com.maskbook.COTM'

export const COTM_CONSTANTS = {
    COTM_TOKEN_ADDRESS: {
        [ChainId.Mainnet]: '0x797ce6d5a2e4ba7ed007b01a42f797a050a3cbd8',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '0x73945b47a02a77a6b2ae86a023d1106ce3f01fa0',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
}

// the total NFT token count for #CreativityOnTheMove season
export const MAX_TOKEN_COUNT = 20
