import { decodeArrayBuffer } from '@dimensiondev/kit'
import {
    ECKeyIdentifier,
    ECKeyIdentifierFromJsonWebKey,
    IdentifierMap,
    isAESJsonWebKey,
    isEC_Private_JsonWebKey,
    isEC_Public_JsonWebKey,
    PostIVIdentifier,
    ProfileIdentifier,
    RelationFavor,
} from '@masknet/shared-base'
import { decode } from '@msgpack/msgpack'
import { createEmptyNormalizedBackup } from '../normalize'
import type { NormalizedBackup } from '../normalize/type'

export function isBackupVersion2(item: unknown): item is BackupJSONFileVersion2 {
    try {
        const x = item as BackupJSONFileVersion2
        return x._meta_.version === 2
    } catch {}
    return false
}

export function normalizeBackupVersion2(item: BackupJSONFileVersion2): NormalizedBackup.Data {
    const backup = createEmptyNormalizedBackup()

    backup.meta.version = 2
    backup.meta.maskVersion = item._meta_.maskbookVersion
    backup.meta.createdAt = new Date(item._meta_.createdAt)
    backup.settings.grantedHostPermissions = item.grantedHostPermissions

    const { personas, posts, profiles, relations, wallets, plugin } = item

    for (const persona of personas) {
        const { publicKey } = persona
        if (!isEC_Public_JsonWebKey(publicKey)) continue
        const identifier = ECKeyIdentifierFromJsonWebKey(publicKey)
        const normalizedPersona: NormalizedBackup.PersonaBackup = {
            identifier,
            linkedProfiles: new IdentifierMap<ProfileIdentifier, any>(new Map(), ProfileIdentifier),
            publicKey,
            createdAt: new Date(persona.createdAt),
            updatedAt: new Date(persona.updatedAt),
            nickname: persona.nickname,
        }
        if (persona.mnemonic) {
            const { words, parameter } = persona.mnemonic
            normalizedPersona.mnemonic = { words, hasPassword: parameter.withPassword, path: parameter.path }
        }
        if (isEC_Private_JsonWebKey(persona.privateKey)) normalizedPersona.privateKey = persona.privateKey
        if (isAESJsonWebKey(persona.localKey)) normalizedPersona.localKey = persona.localKey

        backup.personas.set(identifier, normalizedPersona)
    }

    for (const profile of profiles) {
        const identifier = ProfileIdentifier.fromString(profile.identifier, ProfileIdentifier)
        if (identifier.err) continue
        const normalizedProfile: NormalizedBackup.ProfileBackup = {
            identifier: identifier.val,
            createdAt: new Date(profile.createdAt),
            updatedAt: new Date(profile.updatedAt),
            nickname: profile.nickname,
        }
        if (profile.linkedPersona) {
            const id = ECKeyIdentifier.fromString(profile.linkedPersona, ECKeyIdentifier)
            if (id.ok) {
                if (backup.personas.has(id.val) && backup.personas.get(id.val)!.linkedProfiles.has(identifier.val)) {
                    normalizedProfile.linkedPersona = id.val
                }
            }
        }
        if (isAESJsonWebKey(profile.localKey)) normalizedProfile.localKey = profile.localKey

        backup.profiles.set(identifier.val, normalizedProfile)
    }

    for (const persona of backup.personas.values()) {
        const toRemove: ProfileIdentifier[] = []
        for (const profile of persona.linkedProfiles.keys()) {
            if (backup.profiles.get(profile)?.linkedPersona?.equals(persona.identifier)) {
                // do nothing
            } else toRemove.push(profile)
        }
        for (const profile of toRemove) persona.linkedProfiles.delete(profile)
    }

    for (const post of posts) {
        const identifier = PostIVIdentifier.fromString(post.identifier, PostIVIdentifier)
        const postBy = ProfileIdentifier.fromString(post.postBy, ProfileIdentifier)
        const encryptBy = post.encryptBy ? ECKeyIdentifier.fromString(post.encryptBy, ECKeyIdentifier) : null

        if (identifier.err) continue
        const interestedMeta = new Map<string, any>()
        const normalizedPost: NormalizedBackup.PostBackup = {
            identifier: identifier.val,
            foundAt: new Date(post.foundAt),
            postBy: postBy.unwrapOr(ProfileIdentifier.unknown),
            interestedMeta,
            encryptBy: encryptBy?.unwrapOr(undefined),
            summary: post.summary,
            url: post.url,
        }

        if (isAESJsonWebKey(post.postCryptoKey)) normalizedPost.postCryptoKey = post.postCryptoKey
        if (post.recipients) {
            if (post.recipients === 'everyone') normalizedPost.recipients = { type: 'public' }
            else {
                const map = new IdentifierMap<ProfileIdentifier, NormalizedBackup.RecipientReason[]>(
                    new Map(),
                    ProfileIdentifier,
                )
                for (const [recipient, { reason }] of post.recipients) {
                    const id = ProfileIdentifier.fromString(recipient, ProfileIdentifier)
                    if (id.err) continue
                    const reasons: NormalizedBackup.RecipientReason[] = []
                    map.set(id.val, reasons)
                    for (const r of reason) {
                        // we ignore the original reason because we no longer support group / auto sharing
                        reasons.push({ type: 'direct', at: new Date(r.at) })
                    }
                }
                normalizedPost.recipients = { type: 'e2e', receivers: map }
            }
        }
        if (post.interestedMeta) normalizedPost.interestedMeta = MetaFromJson(post.interestedMeta)

        backup.posts.set(identifier.val, normalizedPost)
    }

    for (const relation of relations) {
        const { profile, persona, favor } = relation
        const a = ProfileIdentifier.fromString(profile, ProfileIdentifier)
        const b = ECKeyIdentifier.fromString(persona, ECKeyIdentifier)
        if (a.ok && b.ok) {
            backup.relations.push({
                profile: a.val,
                persona: b.val,
                favor: favor,
            })
        }
    }

    for (const wallet of wallets) {
        const { publicKey, privateKey } = wallet
        if (!isEC_Public_JsonWebKey(publicKey)) continue
        if (!isEC_Private_JsonWebKey(privateKey)) continue

        const normalizedWallet: NormalizedBackup.WalletBackup = {
            address: wallet.address,
            name: wallet.name,
            passphrase: wallet.passphrase,
            publicKey,
            privateKey,
            mnemonic: wallet.mnemonic
                ? {
                      words: wallet.mnemonic.words,
                      hasPassword: wallet.mnemonic.parameter.withPassword,
                      path: wallet.mnemonic.parameter.path,
                  }
                : undefined,
            createdAt: new Date(wallet.createdAt),
            updatedAt: new Date(wallet.updatedAt),
        }
        backup.wallets.push(normalizedWallet)
    }

    backup.plugins = plugin || {}

    return backup
}

function MetaFromJson(meta: string | undefined): Map<string, unknown> {
    if (!meta) return new Map()
    const raw = decode(decodeArrayBuffer(meta))
    if (typeof raw !== 'object' || !raw) return new Map()
    return new Map(Object.entries(raw))
}

/**
 * @see https://github.com/DimensionDev/Maskbook/issues/194
 */
interface BackupJSONFileVersion2 {
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
    relations: Array<{
        profile: string // ProfileIdentifier.toText()
        persona: string // PersonaIdentifier.toText()
        favor: RelationFavor
    }>
    /** @deprecated */
    userGroups: never[]
    posts: Array<{
        postBy: string // ProfileIdentifier.toText()
        identifier: string // PostIVIdentifier.toText()
        postCryptoKey?: JsonWebKey
        recipients: 'everyone' | [/** ProfileIdentifier.toText() */ string, { reason: RecipientReasonJSON[] }][]
        /** @deprecated */
        recipientGroups: never[] // Array<GroupIdentifier.toText()>
        foundAt: number // Unix timestamp
        encryptBy?: string // PersonaIdentifier.toText()
        url?: string
        summary?: string
        interestedMeta?: string // encoded by MessagePack
    }>
    wallets: Array<{
        address: string
        name: string
        passphrase?: string
        publicKey?: JsonWebKey
        privateKey?: JsonWebKey
        mnemonic?: {
            words: string
            parameter: { path: string; withPassword: boolean }
        }
        createdAt: number // Unix timestamp
        updatedAt: number // Unix timestamp
    }>
    grantedHostPermissions: string[]
    plugin?: Record<string, unknown>
}

interface LinkedProfileDetails {
    connectionConfirmState: 'confirmed' | 'pending' | 'denied'
}

type RecipientReasonJSON = (
    | { type: 'auto-share' }
    | { type: 'direct' }
    | { type: 'group'; /** GroupIdentifier */ group: string }
) & {
    at: number
}
