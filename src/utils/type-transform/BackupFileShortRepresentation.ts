import { ProfileIdentifier, Identifier, ECKeyIdentifier, PersonaIdentifier } from '../../database/type'
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
export function compressBackupFile(file: BackupJSONFileLatest, profileIdentifier?: ProfileIdentifier): string {
    const { grantedHostPermissions, profiles, personas } = file
    if (!profileIdentifier)
        profileIdentifier = Identifier.fromString(profiles[0].identifier, ProfileIdentifier).unwrap()
    const profile = profiles.find(x => x.identifier === profileIdentifier!.toText())
    if (!profile?.linkedPersona) throw new Error('Target profile/persona not found')
    const persona = personas.find(x => x.identifier === profile.linkedPersona)
    if (!persona?.privateKey) throw new Error('Target persona not found')
    const { localKey, nickname, privateKey, linkedProfiles } = persona
    return ([
        '1',
        profileIdentifier.network,
        profileIdentifier.userId,
        nickname,
        localKey?.k ||
            profiles.filter(x => x.linkedPersona === profileIdentifier!.toText()).filter(x => x.localKey)[0]?.localKey
                ?.k ||
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

    if (version !== '1') throw new Error(`QR Code cannot be shared between different version of Maskbook`)

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
                linkedProfiles: [[profileID.toText(), { connectionConfirmState: 'confirmed' }]],
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
