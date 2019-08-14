import { OnlyRunInContext } from '@holoflows/kit/es'
OnlyRunInContext('background', 'EncryptService')

export { encryptComment, decryptComment } from '../../crypto/crypto-alpha-40'
export { decryptFrom } from './CryptoServices/decryptFrom'
export { encryptTo, publishPostAESKey } from './CryptoServices/encryptTo'
export { appendShareTarget } from './CryptoServices/appendShareTarget'
export { getSharedListOfPost } from './CryptoServices/getSharedListOfPost'
export { verifyOthersProve } from './CryptoServices/verifyOthersProve'
export { getMyProveBio } from './CryptoServices/getMyProveBio'
