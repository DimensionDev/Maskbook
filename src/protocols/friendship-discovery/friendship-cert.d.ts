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
export interface FriendshipCertificatePackedV1 {
    version: 1
    /**
     * ! A NEW RANDOM crypto key !
     * ! If a server receive a cert with a cryptoKey previously received, reject it !
     */
    cryptoKey: JsonWebKey
    /**
     * This is encrypted {@link FriendshipCertificate} by {@link FriendshipCertificatePacked.cryptoKey}
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
