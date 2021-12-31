import { ImageType } from './types'
export const PetsPluginID = 'com.maskbook.pets'
export const TWITTER = 'twitter.com'
export const MASK_TWITTER = 'realMaskNetwork'
export const DEFAULT_SET_WORD = 'Visit D.Market in Dashboard and set up your Non-Fungible Friend now!'
export const DEFAULT_MASK_WORD = 'hello Mask'

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
