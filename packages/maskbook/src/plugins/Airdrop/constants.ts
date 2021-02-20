import { ChainId } from '../../web3/types'

export const AirdropMetaKey = 'com.maskbook.airdrop:1'
export const AirdropPluginID = 'com.maskbook.airdrop'

export const AIRDROP_CONSTANTS = {
    AIRDROP_CONTRACT_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '0xB6b53939447c57436A44d8a1bE9f4F3cD24301f7', // proof root: 0x78526288030b951aef50b272f54f511dcf70ea79f9b34457736ca4cefbf8b236
        [ChainId.Rinkeby]: '0x6Fa4b8B9b8Db81730ba9C86c72baa43aDcC2eA2a', // proof root: 0x78526288030b951aef50b272f54f511dcf70ea79f9b34457736ca4cefbf8b236
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
}
