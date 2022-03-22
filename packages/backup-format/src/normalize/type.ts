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
        maskVersion?: string
        createdAt?: Date
    }
    export interface PersonaBackup {
        identifier: PersonaIdentifier
        mnemonic?: Mnemonic
        publicKey: EC_Public_JsonWebKey
        privateKey?: EC_Private_JsonWebKey
        localKey?: AESJsonWebKey
        linkedProfiles: IdentifierMap<ProfileIdentifier, unknown>
        nickname?: string
        createdAt?: Date
        updatedAt?: Date
    }
    export interface Mnemonic {
        words: string
        path: string
        hasPassword: boolean
    }
    export interface ProfileBackup {
        identifier: ProfileIdentifier
        nickname?: string
        localKey?: AESJsonWebKey
        linkedPersona?: PersonaIdentifier
        createdAt?: Date
        updatedAt?: Date
    }
    export interface RelationBackup {
        profile: ProfileIdentifier
        persona: PersonaIdentifier
        favor: RelationFavor
    }
    export interface PostBackup {
        identifier: PostIVIdentifier
        postBy: ProfileIdentifier
        postCryptoKey?: AESJsonWebKey
        recipients?: PostReceiverPublic | PostReceiverE2E
        foundAt: Date
        encryptBy?: PersonaIdentifier
        url?: string
        summary?: string
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
        group?: unknown
        at: Date
    }
    export interface WalletBackup {
        address: string
        name: string
        passphrase?: string
        publicKey?: EC_Public_JsonWebKey
        privateKey?: EC_Private_JsonWebKey
        mnemonic?: Mnemonic
        createdAt: Date
        updatedAt: Date
    }
    export interface SettingsBackup {
        grantedHostPermissions: string[]
    }
}
