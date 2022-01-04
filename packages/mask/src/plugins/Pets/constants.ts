import { ImageType } from './types'
export const PetsPluginID = 'com.maskbook.pets'
export const TWITTER = 'twitter.com'
export const MASK_TWITTER = 'realMaskNetwork'
export const DEFAULT_SET_WORD = 'Click the Mask icon to the left and set up your Non-Fungible Friend in "NFTs" tab!'
export const DEFAULT_PUNK_MASK_WORD = `I'm CryptoPunk #6128... in 3D & with a body! Voyagers, welcome to the uncharted waters of WEB3!`

export const initMeta = {
    userId: '',
    tokenId: '',
    contract: '',
    word: '',
    image: '',
    type: ImageType.NORMAL,
}

export const initCollection = {
    name: '',
    contract: '',
    tokens: [],
}

export const Punk3D = {
    contract: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb',
    tokenId: '6128',
    url: 'https://gateway.pinata.cloud/ipfs/QmZjfo1zKTfQZjqs4CaZJ7pQDZHrUBaozre8Z71c7ZXGMc',
}
