import { ProfileIdentifier } from '../../database/type'
import type { EC_Public_JsonWebKey, AESJsonWebKey } from '../../modules/CryptoAlgorithm/interfaces/utils'

/**
 * Server guide:
 * - On receive `packed`:
 *      1. If `packed.cryptoKey` is used before, drop it.
 *      2. Set `packed.timestamp` to current time.
 *      3. Drop this object after a period of time. e.g. 31days
 */
/**
 * @remarks
 * ! This object should be encrypted with a NEW RANDOM crypto key !
 */
export interface FriendshipCertificateDecryptedV1 {
    /**
     * Who declared they issued this certificate
     * ! DO NOT trust this field !
     */
    certificateIssuer: ProfileIdentifier
    /**
     * ? This key is used to join and decrypt the message in the private channel
     */
    channelCryptoKey: AESJsonWebKey
    /**
     * ? This seed is used to generate the deterministic channel ID
     */
    channelSeed: string
}
export interface FriendshipCertificateEncryptedV1 {
    version: 1
    /**
     * ! A NEW RANDOM crypto key !
     * ! If a server receive a cert with a cryptoKey previously received, reject it !
     */
    cryptoKey: EC_Public_JsonWebKey
    /**
     * This is encrypted {@link FriendshipCertificate} by {@link FriendshipCertificatePacked.cryptoKey}
     */
    payload: string
    /**
     * timestamp
     * ! Server should overwrite it !
     * ? If server is some kind of decentralized instance message service,
     * ? use the message timestamp
     */
    timestamp: number
    /** iv used to decrypt the payload */
    iv: string
}
