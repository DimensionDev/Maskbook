import { BackupJSONFileLatest } from './BackupFile'
import { PersonIdentifier } from '../../database/type'
import { compressSecp256k1Key, decompressSecp256k1Key } from './SECP256k1-Compression'
import { Person } from '../../database'

export type BackupJSONFileLatestShort = [
    PersonIdentifier['network'],
    PersonIdentifier['userId'],
    Person['nickname'],
    // LocalKey
    JsonWebKey['k'],
    // Compressed publicKey
    string,
    // Compressed privateKey
    string,
    // BackupJSONFileLatest['grantedHostPermissions'].join(';'),
    string,
]
export function compressBackupFile(file: BackupJSONFileLatest): string {
    const { grantedHostPermissions, maskbookVersion, people, version, whoami } = file
    if (!whoami[0]) throw new Error('Empty backup file')
    const { localKey, network, nickname, publicKey, privateKey, userId } = whoami[0]
    return [
        network,
        userId,
        nickname,
        localKey.k,
        compressSecp256k1Key(publicKey, 'public'),
        compressSecp256k1Key(privateKey, 'private'),
        grantedHostPermissions.join(';'),
    ].join('🤔')
}
export function decompressBackupFile(short: string): BackupJSONFileLatest {
    let compressed: string
    try {
        compressed = JSON.parse(short)
        if (typeof compressed === 'object') return compressed
    } catch {
        if (!short.includes('🤔')) throw new Error('This backup is not a compressed string')
        compressed = short
    }
    const [network, userId, nickname, localKey, publicKey, privateKey, grantedHostPermissions] = compressed.split(
        '🤔',
    ) as BackupJSONFileLatestShort

    return {
        grantedHostPermissions: grantedHostPermissions.split(';'),
        maskbookVersion: browser.runtime.getManifest().version,
        version: 1,
        whoami: [
            {
                'Power Users look here! You should add the value in this field to the bio to make Maskbook work! ->':
                    '',
                localKey: {
                    alg: 'A256GCM',
                    ext: true,
                    k: localKey,
                    key_ops: ['encrypt', 'decrypt'],
                    kty: 'oct',
                },
                network,
                nickname,
                privateKey: decompressSecp256k1Key(privateKey, 'private'),
                publicKey: decompressSecp256k1Key(publicKey, 'public'),
                userId,
            },
        ],
    }
}
