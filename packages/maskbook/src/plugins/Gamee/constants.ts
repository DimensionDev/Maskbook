import { ChainId } from '../../web3/types'

export const GameeMetaKey = 'com.gamee.nft:1'
export const GameePluginID = 'com.gamee.nft'

export const GAMEE_CONSTANTS = {
    TOKEN_ADDRESS: {
        [ChainId.Mainnet]: '0x797ce6d5a2e4ba7ed007b01a42f797a050a3cbd8',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '0xdb52de365ad57bf54272e2ea37bb8651b44bb397',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
}
