import { ChainId } from '../../web3/types'

export const AirdropMetaKey = 'com.maskbook.airdrop:1'
export const AirdropPluginID = 'com.maskbook.airdrop'

export const AIRDROP_CONSTANTS = {
    AIRDROP_CONTRACT_ADDRESS: {
        [ChainId.Mainnet]: '0x0000000000000000000000000000000000000000',

        // token: 0x5B966f3a32Db9C180843bCb40267A66b73E4f022
        // start: 1614342224
        // end: 1614614400
        // proof root: 0x127fbceb4f7fe6dd37769da52ef29ac2b322584d369bcb89df39092b3eced979
        [ChainId.Ropsten]: '0x022433708964fB27493BaFF4570dBD5A4a9dfd03',

        // token: 0xFD9Eb54f6aC885079e7bB3E207922Bb7256E3fcb
        // start: 1613900000
        // end: 1663900000
        // proof root: 0x9fbb7d9cdcfc16dde42d74f08a2debc2d2466a9ac424a34ccea9528b7ce7db80
        [ChainId.Rinkeby]: '0x2189D088927bfc1563d0b3E447F6472402FED6DD',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
}
