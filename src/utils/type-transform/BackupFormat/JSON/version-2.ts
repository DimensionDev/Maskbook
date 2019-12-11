import { LinkedProfileDetails } from '../../../../database/Persona/Persona.db'
import { RecipientDetail } from '../../../../database/post'

/* eslint-disable import/no-deprecated */
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
        identifier: string // PersonaIdentifier.toText()
        mnemonic?: {
            words: string
            parameter: { path: string; withPassword: boolean }
        }
        publicKey: JsonWebKey
        privateKey?: JsonWebKey
        localKey?: JsonWebKey
        nickname?: string
        linkedProfiles: Record</** ProfileIdentifier.toText() */ string, LinkedProfileDetails>
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
        recipients: Record</** ProfileIdentifier.toText() */ string, RecipientDetail>
        recipientGroups: string[] // Array<GroupIdentifier.toText()>
        foundAt: number // Unix timestamp
    }>
}
