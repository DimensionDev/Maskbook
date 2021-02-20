import { ChainId } from '../../web3/types'

export const AirdropMetaKey = 'com.maskbook.airdrop:1'
export const AirdropPluginID = 'com.maskbook.airdrop'

export const AIRDROP_CONSTANTS = {
    AIRDROP_CONTRACT_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '0xdB6192a62ED7Fea77Bd0B821F86237ab89c29011', // proof root: 0x78526288030b951aef50b272f54f511dcf70ea79f9b34457736ca4cefbf8b236
        [ChainId.Rinkeby]: '0x6Fa4b8B9b8Db81730ba9C86c72baa43aDcC2eA2a', // proof root: 0x78526288030b951aef50b272f54f511dcf70ea79f9b34457736ca4cefbf8b236
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
}
