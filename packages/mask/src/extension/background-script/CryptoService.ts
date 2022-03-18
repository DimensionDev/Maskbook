import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { steganographyEncodeImage as __steganographyEncodeImage, EncodeImageOptions } from '@masknet/encryption'
import { steganographyDownloadImage } from './CryptoServices/utils'
assertEnvironment(Environment.ManifestBackground)

export { encryptComment, decryptComment } from '../../crypto/crypto-alpha-40'
// export { encryptTo, publishPostAESKey } from './CryptoServices/encryptTo'
export { encryptTo } from '../../../background/services/crypto/encryption'
export { appendShareTarget } from '../../../background/services/crypto/appendEncryption'
export { getPartialSharedListOfPost } from './CryptoServices/getPartialSharedListOfPost'

export function steganographyEncodeImage(buf: ArrayBuffer, options: Omit<EncodeImageOptions, 'downloadImage'>) {
    return __steganographyEncodeImage(buf, { ...options, downloadImage: steganographyDownloadImage })
}
