import { ProfileIdentifier, Identifier, PersonaIdentifier, ECKeyIdentifierFromJsonWebKey } from '../../database/type'
import { compressSecp256k1Key, decompressSecp256k1Key } from './SECP256k1-Compression'
import type { BackupJSONFileLatest } from './BackupFormat/JSON/latest'
import type { ProfileRecord } from '../../database/Persona/Persona.db'
import type { AESJsonWebKey } from '../../modules/CryptoAlgorithm/interfaces/utils'

export type BackupJSONFileLatestShort = [
    string, // version, should be "1"
    // network and userId may be empty string for unconnected persona!
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

export function sanitizeBackupFile(backup: BackupJSONFileLatest): BackupJSONFileLatest {
    return {
        ...backup,
        grantedHostPermissions: backup.grantedHostPermissions.filter((url) => /^(http|<all_urls>)/.test(url)),
    }
}

export function compressBackupFile(
    file: BackupJSONFileLatest,
    {
        profileIdentifier,
        personaIdentifier,
    }: {
        profileIdentifier?: ProfileIdentifier
        personaIdentifier?: PersonaIdentifier
    } = {},
): string {
    const { grantedHostPermissions, profiles, personas } = file
    const personaIdentifier_ =
        personaIdentifier?.toText() ?? profiles.find((x) => x.identifier === profileIdentifier?.toText())?.linkedPersona
    const persona = personas.find((x) => x.identifier === personaIdentifier_)
    if (!persona || !persona.privateKey) throw new Error('Target persona not found')
    const linkedProfile = persona.linkedProfiles[0]?.[0]
    const profileIdentifier_ =
        profileIdentifier ?? linkedProfile
            ? Identifier.fromString(linkedProfile, ProfileIdentifier).unwrap()
            : undefined
    const { localKey, nickname, privateKey } = persona
    return (
        [
            '1',
            profileIdentifier_?.network,
            profileIdentifier_?.userId,
            nickname,
            localKey?.k ||
                profiles.filter((x) => x.identifier === profileIdentifier_?.toText()).filter((x) => x.localKey)[0]
                    ?.localKey?.k ||
                '',
            compressSecp256k1Key(privateKey, 'private'),
            grantedHostPermissions.join(';'),
        ] as BackupJSONFileLatestShort
    ).join('🤔')
}
export function decompressBackupFile(short: string): BackupJSONFileLatest {
    let compressed: string
    try {
        compressed = JSON.parse(short)
        if (typeof compressed === 'object') return sanitizeBackupFile(compressed)
    } catch {
        if (!short.includes('🤔')) throw new Error('This backup is not a compressed string')
        compressed = short
    }
    const [version, network, userID, nickname, localKey, privateKey, grantedHostPermissions] = compressed.split(
        '🤔',
    ) as BackupJSONFileLatestShort

    if (version !== '1') throw new Error(`QR Code cannot be shared between different version of Mask`)

    const localKeyJWK = {
        alg: 'A256GCM',
        ext: true,
        k: localKey,
        key_ops: ['encrypt', 'decrypt'],
        kty: 'oct',
    } as AESJsonWebKey
    const publicJWK = decompressSecp256k1Key(privateKey, 'public')
    const privateJWK = decompressSecp256k1Key(privateKey, 'private')

    const profileID = network && userID ? new ProfileIdentifier(network, userID) : undefined
    const ECID = ECKeyIdentifierFromJsonWebKey(publicJWK)
    return sanitizeBackupFile({
        _meta_: {
            createdAt: 0,
            maskbookVersion: browser.runtime.getManifest().version,
            version: 2,
            type: 'maskbook-backup',
        },
        grantedHostPermissions: grantedHostPermissions.split(';').filter(Boolean),
        posts: [],
        wallets: [],
        userGroups: [],
        personas: [
            {
                createdAt: 0,
                updatedAt: 0,
                privateKey: privateJWK,
                publicKey: publicJWK,
                identifier: ECID.toText(),
                linkedProfiles: profileID ? [[profileID.toText(), { connectionConfirmState: 'confirmed' }]] : [],
                nickname,
                localKey: localKeyJWK,
            },
        ],
        profiles: profileID
            ? [
                  {
                      createdAt: 0,
                      identifier: profileID.toText(),
                      updatedAt: 0,
                      linkedPersona: ECID.toText(),
                      nickname: nickname,
                      localKey: localKeyJWK,
                  },
              ]
            : [],
    })
}
