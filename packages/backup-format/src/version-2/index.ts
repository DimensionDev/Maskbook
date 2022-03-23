import { decodeArrayBuffer, encodeArrayBuffer, safeUnreachable } from '@dimensiondev/kit'
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
import { decode, encode } from '@msgpack/msgpack'
import { Err, None, Some } from 'ts-results'
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
    backup.meta.maskVersion = Some(item._meta_.maskbookVersion)
    backup.meta.createdAt = Some(new Date(item._meta_.createdAt))
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
            privateKey: isEC_Private_JsonWebKey(persona.privateKey) ? Some(persona.privateKey) : None,
            localKey: isAESJsonWebKey(persona.localKey) ? Some(persona.localKey) : None,
            createdAt: Some(new Date(persona.createdAt)),
            updatedAt: Some(new Date(persona.updatedAt)),
            nickname: persona.nickname ? Some(persona.nickname) : None,
            mnemonic: None,
        }
        if (persona.mnemonic) {
            const { words, parameter } = persona.mnemonic
            normalizedPersona.mnemonic = Some({ words, hasPassword: parameter.withPassword, path: parameter.path })
        }

        backup.personas.set(identifier, normalizedPersona)
    }

    for (const profile of profiles) {
        const identifier = ProfileIdentifier.fromString(profile.identifier, ProfileIdentifier)
        if (identifier.err) continue
        const normalizedProfile: NormalizedBackup.ProfileBackup = {
            identifier: identifier.val,
            createdAt: Some(new Date(profile.createdAt)),
            updatedAt: Some(new Date(profile.updatedAt)),
            nickname: profile.nickname ? Some(profile.nickname) : None,
            linkedPersona: None,
            localKey: isAESJsonWebKey(profile.localKey) ? Some(profile.localKey) : None,
        }
        if (profile.linkedPersona) {
            const id = ECKeyIdentifier.fromString(profile.linkedPersona, ECKeyIdentifier)
            if (id.ok) {
                if (backup.personas.has(id.val) && backup.personas.get(id.val)!.linkedProfiles.has(identifier.val)) {
                    normalizedProfile.linkedPersona = Some(id.val)
                }
            }
        }
        backup.profiles.set(identifier.val, normalizedProfile)
    }

    for (const persona of backup.personas.values()) {
        const toRemove: ProfileIdentifier[] = []
        for (const profile of persona.linkedProfiles.keys()) {
            if (backup.profiles.get(profile)?.linkedPersona?.unwrapOr(undefined)?.equals(persona.identifier)) {
                // do nothing
            } else toRemove.push(profile)
        }
        for (const profile of toRemove) persona.linkedProfiles.delete(profile)
    }

    for (const post of posts) {
        const identifier = PostIVIdentifier.fromString(post.identifier, PostIVIdentifier)
        const postBy = ProfileIdentifier.fromString(post.postBy, ProfileIdentifier)
        const encryptBy = post.encryptBy ? ECKeyIdentifier.fromString(post.encryptBy, ECKeyIdentifier) : Err.EMPTY

        if (identifier.err) continue
        const interestedMeta = new Map<string, any>()
        const normalizedPost: NormalizedBackup.PostBackup = {
            identifier: identifier.val,
            foundAt: new Date(post.foundAt),
            postBy: postBy.unwrapOr(ProfileIdentifier.unknown),
            interestedMeta,
            encryptBy: encryptBy.toOption(),
            summary: post.summary ? Some(post.summary) : None,
            url: post.url ? Some(post.url) : None,
            postCryptoKey: isAESJsonWebKey(post.postCryptoKey) ? Some(post.postCryptoKey) : None,
            recipients: None,
        }

        if (post.recipients) {
            if (post.recipients === 'everyone')
                normalizedPost.recipients = Some<NormalizedBackup.PostReceiverPublic>({ type: 'public' })
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
                normalizedPost.recipients = Some<NormalizedBackup.PostReceiverE2E>({ type: 'e2e', receivers: map })
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
        const normalizedWallet: NormalizedBackup.WalletBackup = {
            address: wallet.address,
            name: wallet.name,
            passphrase: wallet.passphrase ? Some(wallet.passphrase) : None,
            publicKey: isEC_Public_JsonWebKey(wallet.publicKey) ? Some(wallet.publicKey) : None,
            privateKey: isEC_Private_JsonWebKey(wallet.privateKey) ? Some(wallet.privateKey) : None,
            mnemonic: wallet.mnemonic
                ? Some({
                      words: wallet.mnemonic.words,
                      hasPassword: wallet.mnemonic.parameter.withPassword,
                      path: wallet.mnemonic.parameter.path,
                  })
                : None,
            createdAt: new Date(wallet.createdAt),
            updatedAt: new Date(wallet.updatedAt),
        }
        backup.wallets.push(normalizedWallet)
    }

    backup.plugins = plugin || {}

    return backup
}

export function generateBackupVersion2(item: NormalizedBackup.Data): BackupJSONFileVersion2 {
    const result: BackupJSONFileVersion2 = {
        _meta_: {
            maskbookVersion: item.meta.maskVersion.unwrapOr('>=2.5.0'),
            createdAt: Number(item.meta.createdAt),
            type: 'maskbook-backup',
            version: 2,
        },
        grantedHostPermissions: item.settings.grantedHostPermissions,
        plugin: item.plugins,
        personas: [],
        posts: [],
        profiles: [],
        relations: [],
        wallets: [],
        userGroups: [],
    }
    for (const [id, data] of item.personas) {
        result.personas.push({
            identifier: id.toText(),
            createdAt: Number(data.createdAt),
            updatedAt: Number(data.updatedAt),
            nickname: data.nickname.unwrapOr(undefined),
            linkedProfiles: [...data.linkedProfiles.keys()].map((id) => [
                id.toText(),
                { connectionConfirmState: 'confirmed' } as LinkedProfileDetails,
            ]),
            publicKey: data.publicKey,
            privateKey: data.privateKey.unwrapOr(undefined),
            mnemonic: data.mnemonic
                .map((data) => ({
                    words: data.words,
                    parameter: { path: data.path, withPassword: data.hasPassword },
                }))
                .unwrapOr(undefined),
            localKey: data.localKey.unwrapOr(undefined),
        })
    }

    for (const [id, data] of item.profiles) {
        result.profiles.push({
            identifier: id.toText(),
            createdAt: Number(data.createdAt),
            updatedAt: Number(data.updatedAt),
            nickname: data.nickname.unwrapOr(undefined),
            linkedPersona: data.linkedPersona.unwrapOr(undefined)?.toText(),
            localKey: data.localKey.unwrapOr(undefined),
        })
    }

    for (const [id, data] of item.posts) {
        const item: BackupJSONFileVersion2['posts'][0] = {
            identifier: id.toText(),
            foundAt: Number(data.foundAt),
            postBy: data.postBy.toText(),
            interestedMeta: MetaToJson(data.interestedMeta),
            encryptBy: data.encryptBy.unwrapOr(undefined)?.toText(),
            summary: data.summary.unwrapOr(undefined),
            url: data.url.unwrapOr(undefined),
            postCryptoKey: data.postCryptoKey.unwrapOr(undefined),
            recipientGroups: [],
            recipients: [],
        }
        result.posts.push(item)
        if (data.recipients.some) {
            if (data.recipients.val.type === 'public') item.recipients = 'everyone'
            else if (data.recipients.val.type === 'e2e') {
                item.recipients = []
                for (const [recipient, reasons] of data.recipients.val.receivers) {
                    if (!reasons.length) continue
                    item.recipients.push([
                        recipient.toText(),
                        {
                            reason: [
                                {
                                    at: Number(reasons[0].at),
                                    type: 'direct',
                                },
                            ],
                        },
                    ])
                }
            } else safeUnreachable(data.recipients.val)
        }
    }

    for (const data of item.relations) {
        result.relations.push({
            profile: data.profile.toText(),
            persona: data.persona.toText(),
            favor: data.favor,
        })
    }

    for (const data of item.wallets) {
        result.wallets.push({
            address: data.address,
            name: data.name,
            passphrase: data.passphrase.unwrapOr(undefined),
            publicKey: data.publicKey.unwrapOr(undefined),
            privateKey: data.privateKey.unwrapOr(undefined),
            mnemonic: data.mnemonic
                .map((data) => ({
                    words: data.words,
                    parameter: { path: data.path, withPassword: data.hasPassword },
                }))
                .unwrapOr(undefined),
            createdAt: Number(data.createdAt),
            updatedAt: Number(data.updatedAt),
        })
    }
    return result
}

function MetaFromJson(meta: string | undefined): Map<string, unknown> {
    if (!meta) return new Map()
    const raw = decode(decodeArrayBuffer(meta))
    if (typeof raw !== 'object' || !raw) return new Map()
    return new Map(Object.entries(raw))
}
function MetaToJson(meta: ReadonlyMap<string, unknown>) {
    return encodeArrayBuffer(encode(Object.fromEntries(meta.entries())))
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
