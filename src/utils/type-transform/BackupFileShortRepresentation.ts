import { ProfileIdentifier, Identifier } from '../../database/type'
import { compressSecp256k1Key, decompressSecp256k1Key } from './SECP256k1-Compression'
import { Profile } from '../../database'
import { BackupJSONFileLatest } from './BackupFormat/JSON/latest'
import { upgradeFromBackupJSONFileVersion1 } from './BackupFormat/JSON/version-2'

export type BackupJSONFileLatestShort = [
    string, // ProfileIdentifier,
    Profile['nickname'],
    // LocalKey, this field may be empty!
    JsonWebKey['k'],
    // Compressed privateKey
    // ! We can recover pub from priv on ec, but if you want to support other type
    // ! Please change this back to pub/priv pattern
    string,
    // BackupJSONFileLatest['grantedHostPermissions'].join(';'),
    string,
]
export function compressBackupFile(file: BackupJSONFileLatest, index: number): string {
    const { grantedHostPermissions, profiles, personas } = file
    if (!personas[index ?? 0]) throw new Error('Empty backup file')
    const { localKey, nickname, privateKey, identifier } = personas[index]
    if (!privateKey) throw new Error('Invalid private key')
    return [
        identifier,
        nickname,
        localKey?.k ||
            profiles.filter(x => x.linkedPersona === identifier).filter(x => x.localKey)[0]?.localKey?.k ||
            '',
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
    const [identifier, nickname, localKey, privateKey, grantedHostPermissions] = compressed.split(
        '🤔',
    ) as BackupJSONFileLatestShort
    const id = Identifier.fromString(identifier) as ProfileIdentifier

    return upgradeFromBackupJSONFileVersion1({
        grantedHostPermissions: grantedHostPermissions.split(';'),
        maskbookVersion: browser.runtime.getManifest().version,
        version: 1,
        whoami: [
            {
                localKey: {
                    alg: 'A256GCM',
                    ext: true,
                    k: localKey,
                    key_ops: ['encrypt', 'decrypt'],
                    kty: 'oct',
                },
                network: id.network,
                nickname,
                privateKey: decompressSecp256k1Key(privateKey, 'private'),
                publicKey: decompressSecp256k1Key(privateKey, 'public'),
                userId: id.userId,
            },
        ],
    })
}
