import { ChainId } from '../../web3/types'

export const AirdropMetaKey = 'com.maskbook.airdrop:1'
export const AirdropPluginID = 'com.maskbook.airdrop'

export const AIRDROP_CONSTANTS = {
    AIRDROP_CONTRACT_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '0x59c087d85B5baC37d6cCA7B343BBA5718f385347',
        [ChainId.Rinkeby]: '0x91fdf9171b2f6dd10bf1E405C5fEf66A21de3bE5',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
}
