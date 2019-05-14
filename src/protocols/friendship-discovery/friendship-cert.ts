/**
 * Server guide:
 * - On receive `signed`:
 *      1. If `signed.cryptoKey` is used before, drop it.
 *      2. Set `signed.timestamp` to current time.
 *      3. Drop this object after a period of time. e.g. 31days
 */
/**
 * Verify Steps:
 * For each `signed` ({@link FriendshipCertificateSignedV1}):
 *      1. Derive an AES key by `signed.cryptoKey` and your own key, let it be `aes`
 *      2. Decrypt `signed.payload`, if failed, drop it; else, let it be `cert`
 *      3. Manual or automatically verify friendship of `cert.myId` on network `cert.network`
 */
/**
 * @remarks
 * ! This object should be encrypted with a NEW RANDOM crypto key !
 */
export interface FriendshipCertificateV1 {
    /**
     * Indicates which Social Network this certificate belongs to.
     *
     * @example "mastodon@example.com"
     */
    network: string
    /**
     * Who claim they signed this certificate.
     * @remarks
     * ! Do not trust this field !
     * @example "alice.hamilton.2019"
     */
    myId: string
}
export interface FriendshipCertificateSignedV1 {
    version: 1
    /**
     * ! A NEW RANDOM crypto key !
     * ! If a server receive a cert with a cryptoKey previously received, reject it !
     */
    cryptoKey: JsonWebKey
    /**
     * This is encrypted {@link FriendshipCertificate} by {@link FriendshipCertificateSigned.cryptoKey}
     */
    payload: string
    /**
     * timestamp
     * ! Server should overwrite it !
     */
    timestamp: number
    /**
     * iv
     */
    iv: string
}
