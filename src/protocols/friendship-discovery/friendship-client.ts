import type { FriendshipCertificateEncryptedV1 } from './friendship-cert'

declare function publishCertificate(cert: FriendshipCertificateEncryptedV1): Promise<void>
declare function pullCertificates(
    afterTimeStamp: number,
    partition: string,
): Promise<FriendshipCertificateEncryptedV1[]>
