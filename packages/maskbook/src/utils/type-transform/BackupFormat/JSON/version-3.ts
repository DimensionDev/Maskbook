/* eslint-disable import/no-deprecated */
import type { LinkedProfileDetails } from '../../../../database/Persona/Persona.db'
import type { AESJsonWebKey, EC_Private_JsonWebKey, EC_Public_JsonWebKey } from '@masknet/shared'
import { twitterBase } from '../../../../social-network-adaptor/twitter.com/base'
import { facebookBase } from '../../../../social-network-adaptor/facebook.com/base'
import type { BackupJSONFileVersion2 } from './version-2'

export type RecipientReasonJSON = (
    | { type: 'auto-share' }
    | { type: 'direct' }
    | { type: 'group'; group: string /** GroupIdentifier */ }
) & {
    at: number
}

export interface BackupJSONFileVersion3 {
    _meta_: {
        version: 3
        type: 'maskbook-backup'
        maskbookVersion: string // e.g. "1.8.0"
        createdAt: number // Unix timestamp
    }
    identity: {
        identifier: string
        mnemonic?: {
            words: string
            parameter: { path: string; withPassword: boolean }
        }
        publicKey: EC_Public_JsonWebKey
        privateKey?: EC_Private_JsonWebKey
        localKey?: AESJsonWebKey
        createdAt: number
        updatedAt: number
    }
    personas: Array<{
        // ? PersonaIdentifier can be infer from the publicKey
        identifier: string // PersonaIdentifier.toText()
        mnemonic?: {
            words: string
            parameter: { path: string; withPassword: boolean }
        }
        publicKey: EC_Public_JsonWebKey
        privateKey?: EC_Private_JsonWebKey
        localKey?: AESJsonWebKey
        nickname?: string
        linkedProfiles: [/** ProfileIdentifier.toText() */ string, LinkedProfileDetails][]
        createdAt: number // Unix timestamp
        updatedAt: number // Unix timestamp
    }>
    profiles: Array<{
        identifier: string // ProfileIdentifier.toText()
        nickname?: string
        localKey?: AESJsonWebKey
        linkedPersona?: string // PersonaIdentifier.toText()
        createdAt: number // Unix timestamp
        updatedAt: number // Unix timestamp
    }>
    userGroups: Array<{
        groupName: string
        identifier: string // GroupIdentifier.toText()
        members: string[] // Array<ProfileIdentifier.toText()>
        banned?: string[] // Array<ProfileIdentifier.toText()>
    }>
    posts: Array<{
        postBy: string // ProfileIdentifier.toText()
        identifier: string // PostIVIdentifier.toText()
        postCryptoKey?: AESJsonWebKey
        recipients: [/** ProfileIdentifier.toText() */ string, { reason: RecipientReasonJSON[] }][]
        recipientGroups: string[] // Array<GroupIdentifier.toText()>
        foundAt: number // Unix timestamp
    }>
    wallets: Array<{
        address: string
        name: string
        passphrase?: string
        publicKey?: EC_Public_JsonWebKey
        privateKey?: EC_Private_JsonWebKey
        mnemonic?: {
            words: string
            parameter: { path: string; withPassword: boolean }
        }
        createdAt: number // Unix timestamp
        updatedAt: number // Unix timestamp
    }>
    grantedHostPermissions: string[]
}

export function isBackupJSONFileVersion3(obj: object): obj is BackupJSONFileVersion3 {
    return (
        (obj as BackupJSONFileVersion3)?._meta_?.version === 3 &&
        (obj as BackupJSONFileVersion3)?._meta_?.type === 'maskbook-backup'
    )
}

export function upgradeFromBackupJSONFileVersion2(
    json: BackupJSONFileVersion2,
    identifier: string,
): BackupJSONFileVersion3 {
    const personas: BackupJSONFileVersion2['personas'] = json.personas
    const profiles: BackupJSONFileVersion2['profiles'] = json.profiles
    const userGroups: BackupJSONFileVersion2['userGroups'] = []

    const getIdentityByPersonaIdentifier = (id: string) => {
        const persona = personas.find((x) => x.identifier === id)!
        return {
            identifier: identifier,
            mnemonic: persona.mnemonic,
            publicKey: persona.publicKey,
            privateKey: persona.privateKey,
            localKey: persona.localKey,
            createdAt: persona.createdAt,
            updatedAt: persona.updatedAt,
        }
    }

    return {
        _meta_: {
            version: 3,
            type: 'maskbook-backup',
            maskbookVersion: json._meta_.maskbookVersion,
            createdAt: 0,
        },
        identity: getIdentityByPersonaIdentifier(identifier),
        posts: [],
        wallets: [],
        personas,
        profiles,
        userGroups: json.userGroups,
        grantedHostPermissions: json.grantedHostPermissions,
    }
}

export function patchNonBreakingUpgradeForBackupJSONFileVersion3(json: BackupJSONFileVersion3): BackupJSONFileVersion3 {
    json.wallets = json.wallets ?? []
    const permissions = new Set<string>(json.grantedHostPermissions)
    if (json.grantedHostPermissions.some((x) => x.includes('twitter.com'))) {
        const a = twitterBase.declarativePermissions.origins
        a.forEach((x) => permissions.add(x))
    }
    if (json.grantedHostPermissions.some((x) => x.includes('facebook.com'))) {
        const a = facebookBase.declarativePermissions.origins
        a.forEach((x) => permissions.add(x))
    }
    return json
}
