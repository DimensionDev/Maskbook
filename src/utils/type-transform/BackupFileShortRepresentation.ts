import { ProfileIdentifier, Identifier, ECKeyIdentifier } from '../../database/type'
import { compressSecp256k1Key, decompressSecp256k1Key } from './SECP256k1-Compression'
import { BackupJSONFileLatest } from './BackupFormat/JSON/latest'
import { ProfileRecord } from '../../database/Persona/Persona.db'

export type BackupJSONFileLatestShort = [
    string, // version, should be "1"
    ProfileIdentifier['network'],
    ProfileIdentifier['userId'],
    ProfileRecord['nickname'],
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
    const id = Identifier.fromString(identifier, ProfileIdentifier).unwrap('Invalid identifier')
    return ([
        '2',
        id.network,
        id.userId,
        nickname,
        localKey?.k ||
            profiles.filter(x => x.linkedPersona === identifier).filter(x => x.localKey)[0]?.localKey?.k ||
            '',
        compressSecp256k1Key(privateKey, 'private'),
        grantedHostPermissions.join(';'),
    ] as BackupJSONFileLatestShort).join('🤔')
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
    const [version, network, userID, nickname, localKey, privateKey, grantedHostPermissions] = compressed.split(
        '🤔',
    ) as BackupJSONFileLatestShort

    if (version !== '2') throw new Error(`QR Code cannot be shared between different version of Maskbook`)

    const localKeyJWK: JsonWebKey = {
        alg: 'A256GCM',
        ext: true,
        k: localKey,
        key_ops: ['encrypt', 'decrypt'],
        kty: 'oct',
    }
    const publicJWK = decompressSecp256k1Key(privateKey, 'public')
    const privateJWK = decompressSecp256k1Key(privateKey, 'private')

    const profileID = new ProfileIdentifier(network, userID)
    const ECID = ECKeyIdentifier.fromJsonWebKey(publicJWK)
    return {
        _meta_: {
            createdAt: 0,
            maskbookVersion: browser.runtime.getManifest().version,
            version: 2,
            type: 'maskbook-backup',
        },
        grantedHostPermissions: grantedHostPermissions.split(';'),
        posts: [],
        userGroups: [],
        personas: [
            {
                createdAt: 0,
                updatedAt: 0,
                privateKey: privateJWK,
                publicKey: publicJWK,
                identifier: ECID.toText(),
                linkedProfiles: {
                    [profileID.toText()]: { connectionConfirmState: 'confirmed' },
                },
                nickname,
                localKey: localKeyJWK,
            },
        ],
        profiles: [
            {
                createdAt: 0,
                identifier: profileID.toText(),
                updatedAt: 0,
                linkedPersona: ECID.toText(),
                localKey: localKeyJWK,
                nickname: nickname,
            },
        ],
    }
}
