import type {
    PersonaIdentifier,
    EC_Private_JsonWebKey,
    EC_Public_JsonWebKey,
    AESJsonWebKey,
    ProfileIdentifier,
    RelationFavor,
    PostIVIdentifier,
    IdentifierMap,
} from '@masknet/shared-base'
import type { Option } from 'ts-results'

// All optional type in this file is marked by Option<T> because we don't want to miss any field.
export namespace NormalizedBackup {
    export interface Data {
        /** Meta about this backup */
        meta: Meta
        personas: IdentifierMap<PersonaIdentifier, PersonaBackup>
        profiles: IdentifierMap<ProfileIdentifier, ProfileBackup>
        relations: RelationBackup[]
        posts: IdentifierMap<PostIVIdentifier, PostBackup>
        wallets: WalletBackup[]
        settings: SettingsBackup
        plugins: Record<string, unknown>
    }
    export interface Meta {
        /** Backup file version */
        version: 0 | 1 | 2
        /** Backup created by which Mask version */
        maskVersion: Option<string>
        createdAt: Option<Date>
    }
    export interface PersonaBackup {
        identifier: PersonaIdentifier
        mnemonic: Option<Mnemonic>
        publicKey: EC_Public_JsonWebKey
        privateKey: Option<EC_Private_JsonWebKey>
        localKey: Option<AESJsonWebKey>
        linkedProfiles: IdentifierMap<ProfileIdentifier, unknown>
        nickname: Option<string>
        createdAt: Option<Date>
        updatedAt: Option<Date>
    }
    export interface Mnemonic {
        words: string
        path: string
        hasPassword: boolean
    }
    export interface ProfileBackup {
        identifier: ProfileIdentifier
        nickname: Option<string>
        localKey: Option<AESJsonWebKey>
        linkedPersona: Option<PersonaIdentifier>
        createdAt: Option<Date>
        updatedAt: Option<Date>
    }
    export interface RelationBackup {
        profile: ProfileIdentifier
        persona: PersonaIdentifier
        favor: RelationFavor
    }
    export interface PostBackup {
        identifier: PostIVIdentifier
        postBy: ProfileIdentifier
        postCryptoKey: Option<AESJsonWebKey>
        recipients: Option<PostReceiverPublic | PostReceiverE2E>
        foundAt: Date
        encryptBy: Option<PersonaIdentifier>
        url: Option<string>
        summary: Option<string>
        interestedMeta: ReadonlyMap<string, unknown>
    }
    export interface PostReceiverPublic {
        type: 'public'
    }
    export interface PostReceiverE2E {
        type: 'e2e'
        receivers: IdentifierMap<ProfileIdentifier, RecipientReason[]>
    }
    export interface RecipientReason {
        type: 'auto-share' | 'direct' | 'group'
        // We don't care about this field anymore. Do not wrap it with Option<T>
        group?: unknown
        at: Date
    }
    export interface WalletBackup {
        address: string
        name: string
        passphrase: Option<string>
        publicKey: Option<EC_Public_JsonWebKey>
        privateKey: Option<EC_Private_JsonWebKey>
        mnemonic: Option<Mnemonic>
        createdAt: Date
        updatedAt: Date
    }
    export interface SettingsBackup {
        grantedHostPermissions: string[]
    }
}
