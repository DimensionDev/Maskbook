import { OnlyRunInContext } from '@dimensiondev/holoflows-kit/es'
OnlyRunInContext('background', 'EncryptService')

export { encryptComment, decryptComment } from '../../crypto/crypto-alpha-40'
export { encryptTo, publishPostAESKey } from './CryptoServices/encryptTo'
export { appendShareTarget } from './CryptoServices/appendShareTarget'
export { getSharedListOfPost } from './CryptoServices/getSharedListOfPost'
export { verifyOthersProve } from './CryptoServices/verifyOthersProve'
export { getMyProveBio } from './CryptoServices/getMyProveBio'
export { debugShowAllPossibleHashForPost } from './CryptoServices/debugShowAllPossibleHashForPost'
