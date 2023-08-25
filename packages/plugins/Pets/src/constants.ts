import { EMPTY_LIST, PluginID } from '@masknet/shared-base'
import { ImageType } from './types.js'

export const PetsPluginID = PluginID.Pets
export const TWITTER = 'twitter.com'
export const MASK_TWITTER = 'realMaskNetwork'
export const NFF_TWITTER = 'https://twitter.com/NonFFriend'

export const initMeta = {
    userId: '',
    tokenId: '',
    contract: '',
    word: '',
    image: '',
    type: ImageType.NORMAL,
    chainId: undefined,
}

export const initCollection = {
    name: '',
    contract: '',
    icon: '',
    tokens: EMPTY_LIST,
    chainId: undefined,
}

export const Punk3D = {
    contract: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb',
    tokenId: '6128',
    url: 'https://cdn.simplehash.com/assets/fbbba7e60c774884b98e49cb6d48975f4690dfd207ff5861e8db0d9a49b16bba.png',
}

export const GLB3DIcon = new URL('./assets/glb3D.png', import.meta.url).toString()
export const CloseIcon = new URL('./assets/close.png', import.meta.url).toString()
export const DragIcon = new URL('./assets/drag.png', import.meta.url).toString()
export const DefaultIcon = new URL('./assets/defaultIcon.png', import.meta.url).toString()
export const PunkIcon = new URL('./assets/punk2d.png', import.meta.url).toString()
