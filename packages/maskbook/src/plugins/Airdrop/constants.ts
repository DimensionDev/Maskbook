import { ChainId } from '../../web3/types'

export const AirdropMetaKey = 'com.maskbook.airdrop:1'
export const AirdropPluginID = 'com.maskbook.airdrop'

export const AIRDROP_CONSTANTS = {
    AIRDROP_CONTRACT_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
}
