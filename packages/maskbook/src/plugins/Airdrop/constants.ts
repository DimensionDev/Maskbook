import { ChainId } from '../../web3/types'

export const AirdropMetaKey = 'com.maskbook.airdrop:1'
export const AirdropPluginID = 'com.maskbook.airdrop'

export const AIRDROP_CONSTANTS = {
    AIRDROP_CONTRACT_ADDRESS: {
        // token: 0x5B966f3a32Db9C180843bCb40267A66b73E4f022
        // start: 1614394800
        // end: 1614826800
        // proof root: 0x2102463bfadd84077775073d11786017c2818c934088ce5656b5d38a9cf2d3fd
        [ChainId.Mainnet]: '0x7adcfcafb69aae283f4268e59209ba64a5db4d91',

        // token: 0x5B966f3a32Db9C180843bCb40267A66b73E4f022
        // start: 1614359170
        // end: 1614360378
        // proof root: 0x255aabca2c154fdf6b651eb6089da552ab8a0ae82941f2a6f225490701b8ec87
        [ChainId.Ropsten]: '0xf1276B659FF28EDf92accFb013B1E6c9F782bFfF',

        // token: 0xFD9Eb54f6aC885079e7bB3E207922Bb7256E3fcb
        // start: 1613900000
        // end: 1663900000
        // proof root: 0x9fbb7d9cdcfc16dde42d74f08a2debc2d2466a9ac424a34ccea9528b7ce7db80
        [ChainId.Rinkeby]: '0x2189D088927bfc1563d0b3E447F6472402FED6DD',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
}
