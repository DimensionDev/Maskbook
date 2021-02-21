import { ChainId } from '../../web3/types'

export const AirdropMetaKey = 'com.maskbook.airdrop:1'
export const AirdropPluginID = 'com.maskbook.airdrop'

export const AIRDROP_CONSTANTS = {
    AIRDROP_CONTRACT_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '0x479ae9E694515aBCfB7fe6d5e327E37602e3949C', // proof root: 0xacdff1239598028edc9c789d9d852b473213362db2a8e159802bcfb19a0945da
        [ChainId.Rinkeby]: '0x53E9Fe846c3244744f86CAc678899a0f71a9B76C', // proof root: 0xacdff1239598028edc9c789d9d852b473213362db2a8e159802bcfb19a0945da
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
}
