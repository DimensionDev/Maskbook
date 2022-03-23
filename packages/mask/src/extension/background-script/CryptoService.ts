import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
assertEnvironment(Environment.ManifestBackground)

export {
    encryptTo,
    appendShareTarget,
    decryptComment,
    encryptComment,
    steganographyEncodeImage,
} from '../../../background/services/crypto'
export { getPartialSharedListOfPost } from './CryptoServices/getPartialSharedListOfPost'
