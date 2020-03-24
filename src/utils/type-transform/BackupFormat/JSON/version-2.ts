/* eslint-disable import/no-deprecated */
import { LinkedProfileDetails } from '../../../../database/Persona/Persona.db'
import { BackupJSONFileVersion1 } from './version-1'
import { ProfileIdentifier, ECKeyIdentifier, GroupIdentifier } from '../../../../database/type'

export type RecipientReasonJSON = (
    | { type: 'auto-share' }
    | { type: 'direct' }
    | { type: 'group'; group: string /** GroupIdentifier */ }
) & {
    at: number
}
/**
 * @see https://github.com/DimensionDev/Maskbook/issues/194
 *
 * @deprecated Since this is the latest format, you should not use it.
 * Use BackupJSONFileVersionLatest please.
 */
export interface BackupJSONFileVersion2 {
    _meta_: {
        version: 2
        type: 'maskbook-backup'
        maskbookVersion: string // e.g. "1.8.0"
        createdAt: number // Unix timestamp
    }
    personas: Array<{
        // ? PersonaIdentifier can be infer from the publicKey
        identifier: string // PersonaIdentifier.toText()
        mnemonic?: {
            words: string
            parameter: { path: string; withPassword: boolean }
        }
        publicKey: JsonWebKey
        privateKey?: JsonWebKey
        localKey?: JsonWebKey
        nickname?: string
        linkedProfiles: [/** ProfileIdentifier.toText() */ string, LinkedProfileDetails][]
        createdAt: number // Unix timestamp
        updatedAt: number // Unix timestamp
    }>
    profiles: Array<{
        identifier: string // ProfileIdentifier.toText()
        nickname?: string
        localKey?: JsonWebKey
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
        postCryptoKey?: JsonWebKey
        recipients: [/** ProfileIdentifier.toText() */ string, { reason: RecipientReasonJSON[] }][]
        recipientGroups: string[] // Array<GroupIdentifier.toText()>
        foundAt: number // Unix timestamp
    }>
    grantedHostPermissions: string[]
}

export function isBackupJSONFileVersion2(obj: object): obj is BackupJSONFileVersion2 {
    return (
        (obj as BackupJSONFileVersion2)?._meta_?.version === 2 &&
        (obj as BackupJSONFileVersion2)?._meta_?.type === 'maskbook-backup'
    )
}

export function upgradeFromBackupJSONFileVersion1(json: BackupJSONFileVersion1): BackupJSONFileVersion2 {
    const personas: BackupJSONFileVersion2['personas'] = []
    const profiles: BackupJSONFileVersion2['profiles'] = []
    const userGroups: BackupJSONFileVersion2['userGroups'] = []

    function addPersona(record: Omit<typeof personas[0], 'createdAt' | 'updatedAt'>) {
        const prev = personas.find((x) => x.identifier === record.identifier)
        if (prev) {
            Object.assign(prev, record)
            prev.linkedProfiles.push(...record.linkedProfiles)
        } else personas.push({ ...record, updatedAt: 0, createdAt: 0 })
    }

    function addProfile(record: Omit<typeof profiles[0], 'createdAt' | 'updatedAt'>) {
        const prev = profiles.find((x) => x.identifier === record.identifier)
        if (prev) {
            Object.assign(prev, record)
        } else profiles.push({ ...record, updatedAt: 0, createdAt: 0 })
    }

    function addProfileToGroup(
        member: ProfileIdentifier,
        detail: NonNullable<NonNullable<BackupJSONFileVersion1['people']>[0]['groups']>[0],
    ) {
        const groupId = new GroupIdentifier(detail.network, detail.virtualGroupOwner, detail.groupID).toText()
        const prev = userGroups.find((x) => x.identifier === groupId)
        if (prev) {
            prev.members.push(member.toText())
        } else {
            userGroups.push({ groupName: '', identifier: groupId, members: [] })
        }
    }

    for (const x of json.whoami) {
        const profile = new ProfileIdentifier(x.network, x.userId).toText()
        const persona = ECKeyIdentifier.fromJsonWebKey(x.publicKey).toText()
        addProfile({
            identifier: profile,
            linkedPersona: persona,
            localKey: x.localKey,
            nickname: x.nickname,
        })
        addPersona({
            identifier: persona,
            linkedProfiles: [[profile, { connectionConfirmState: 'confirmed' }]],
            publicKey: x.publicKey,
            privateKey: x.privateKey,
            localKey: x.localKey,
            nickname: x.nickname,
        })
    }

    for (const x of json.people || []) {
        const profile = new ProfileIdentifier(x.network, x.userId)
        const persona = ECKeyIdentifier.fromJsonWebKey(x.publicKey).toText()
        addProfile({
            identifier: profile.toText(),
            linkedPersona: persona,
            nickname: x.nickname,
        })
        addPersona({
            identifier: persona,
            linkedProfiles: [[profile.toText(), { connectionConfirmState: 'confirmed' }]],
            publicKey: x.publicKey,
            nickname: x.nickname,
        })
        x.groups?.forEach((y) => addProfileToGroup(profile, y))
    }

    userGroups.forEach((x) => {
        x.members = Array.from(new Set(x.members))
    })

    return {
        _meta_: {
            version: 2,
            type: 'maskbook-backup',
            maskbookVersion: json.maskbookVersion,
            createdAt: 0,
        },
        posts: [],
        personas,
        profiles,
        userGroups,
        grantedHostPermissions: json.grantedHostPermissions,
    }
}
