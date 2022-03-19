import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { steganographyEncodeImage as __steganographyEncodeImage, EncodeImageOptions } from '@masknet/encryption'
import { steganographyDownloadImage } from './CryptoServices/utils'
assertEnvironment(Environment.ManifestBackground)

export { encryptTo } from '../../../background/services/crypto/encryption'
export { encryptComment, decryptComment } from '../../../background/services/crypto/comment'
export { appendShareTarget } from '../../../background/services/crypto/appendEncryption'
export { getPartialSharedListOfPost } from './CryptoServices/getPartialSharedListOfPost'

export function steganographyEncodeImage(buf: ArrayBuffer, options: Omit<EncodeImageOptions, 'downloadImage'>) {
    return __steganographyEncodeImage(buf, { ...options, downloadImage: steganographyDownloadImage })
}
