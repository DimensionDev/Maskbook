import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { steganographyEncodeImage as __steganographyEncodeImage, EncodeImageOptions } from '@masknet/encryption'
import { steganographyDownloadImage } from './CryptoServices/utils'
assertEnvironment(Environment.ManifestBackground)

export { encryptComment, decryptComment } from '../../crypto/crypto-alpha-40'
export { encryptTo, publishPostAESKey } from './CryptoServices/encryptTo'
export { appendShareTarget } from './CryptoServices/appendShareTarget'
export { getPartialSharedListOfPost } from './CryptoServices/getPartialSharedListOfPost'
export { verifyOthersProve } from './CryptoServices/verifyOthersProve'

export function steganographyEncodeImage(buf: ArrayBuffer, options: Omit<EncodeImageOptions, 'downloadImage'>) {
    return __steganographyEncodeImage(buf, { ...options, downloadImage: steganographyDownloadImage })
}

import type { debugShowAllPossibleHashForPost as orig } from './CryptoServices/debugShowAllPossibleHashForPost'
// This module requires lazy loading otherwise it will load gun
export async function debugShowAllPossibleHashForPost(...args: Parameters<typeof orig>) {
    return (await import('./CryptoServices/debugShowAllPossibleHashForPost')).debugShowAllPossibleHashForPost(...args)
}
