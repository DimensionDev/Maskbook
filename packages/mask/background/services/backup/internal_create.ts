import { createEmptyNormalizedBackup, NormalizedBackup } from '@masknet/backup-format'
import { IdentifierMap, PersonaIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { None, Some } from 'ts-results'
import { queryPersonasDB, queryProfilesDB, queryRelations } from '../../database/persona/db'
import { queryPostsDB } from '../../database/post'

// Well, this is a bit of a hack, because we have not move those two parts into this project yet.
let backupPlugins: () => Promise<NormalizedBackup.Data['plugins']>
let backupWallets: () => Promise<NormalizedBackup.WalletBackup[]>
export function delegateWalletBackup(f: typeof backupWallets) {
    backupWallets = f
}
export function delegatePluginBackup(f: typeof backupPlugins) {
    backupPlugins = f
}

/** @internal */
export interface InternalBackupOptions {
    hasPrivateKeyOnly?: boolean
    noPosts?: boolean
    noWallets?: boolean
    noPersonas?: boolean
    noProfiles?: boolean
    onlyForPersona?: PersonaIdentifier
}
/**
 * @internal
 * DO NOT expose this function as a service.
 */
// TODO: use a single readonly transaction in this operation.
export async function createNewBackup(options: InternalBackupOptions): Promise<NormalizedBackup.Data> {
    const { noPersonas, noPosts, noProfiles, noWallets, onlyForPersona } = options
    const file = createEmptyNormalizedBackup()
    const { meta, personas, posts, profiles, relations, settings } = file

    meta.version = 2
    meta.maskVersion = Some(process.env.VERSION || '>=2.5.0')
    meta.createdAt = Some(new Date())

    settings.grantedHostPermissions = (await browser.permissions.getAll()).origins || []

    await Promise.allSettled([
        noPersonas || backupPersonas(onlyForPersona ? [onlyForPersona] : undefined),
        noProfiles || backupProfiles(onlyForPersona),
        (noPersonas && noProfiles) || backupAllRelations(),
        noPosts || backupPosts(),
        noWallets || backupWallets().then((w) => (file.wallets = w)),
        backupPlugins().then((p) => (file.plugins = p)),
    ])

    return file

    async function backupPersonas(of?: PersonaIdentifier[]) {
        const data = await queryPersonasDB(
            {
                initialized: true,
                hasPrivateKey: options.hasPrivateKeyOnly,
                identifiers: of,
            },
            undefined,
            true,
        )
        for (const persona of data) {
            personas.set(persona.identifier, {
                identifier: persona.identifier,
                nickname: persona.nickname ? Some(persona.nickname) : None,
                publicKey: persona.publicKey,
                privateKey: persona.privateKey ? Some(persona.privateKey) : None,
                localKey: persona.localKey ? Some(persona.localKey) : None,
                createdAt: persona.createdAt ? Some(persona.createdAt) : None,
                updatedAt: persona.updatedAt ? Some(persona.updatedAt) : None,
                mnemonic: persona.mnemonic
                    ? Some({
                          hasPassword: persona.mnemonic.parameter.withPassword,
                          path: persona.mnemonic.parameter.path,
                          words: persona.mnemonic.words,
                      })
                    : None,
                linkedProfiles: persona.linkedProfiles,
            })
        }
    }

    async function backupPosts() {
        const data = await queryPostsDB(() => true)
        for (const post of data) {
            let recipients: NormalizedBackup.PostReceiverE2E | NormalizedBackup.PostReceiverPublic = {
                type: 'public',
            }
            if (post.recipients !== 'everyone') {
                recipients = {
                    type: 'e2e',
                    receivers: new IdentifierMap(new Map(), ProfileIdentifier),
                }
                for (const [recipient, reason] of post.recipients) {
                    if (reason.reason.length === 0) continue
                    recipients.receivers.set(recipient, [{ at: reason.reason[0].at, type: 'direct' }])
                }
            }
            posts.set(post.identifier, {
                identifier: post.identifier,
                foundAt: post.foundAt,
                interestedMeta: post.interestedMeta || new Map(),
                postBy: post.postBy,
                encryptBy: post.encryptBy ? Some(post.encryptBy) : None,
                postCryptoKey: post.postCryptoKey ? Some(post.postCryptoKey) : None,
                summary: post.summary ? Some(post.summary) : None,
                url: post.url ? Some(post.url) : None,
                recipients: Some(recipients),
            })
        }
    }

    async function backupProfiles(of?: PersonaIdentifier) {
        const data = await queryProfilesDB({
            hasLinkedPersona: true,
        })
        for (const profile of data) {
            if (of) {
                if (!profile.linkedPersona) continue
                if (!profile.linkedPersona.equals(of)) continue
            }
            profiles.set(profile.identifier, {
                identifier: profile.identifier,
                nickname: profile.nickname ? Some(profile.nickname) : None,
                localKey: profile.localKey ? Some(profile.localKey) : None,
                createdAt: profile.createdAt ? Some(profile.createdAt) : None,
                updatedAt: profile.updatedAt ? Some(profile.updatedAt) : None,
                linkedPersona: profile.linkedPersona ? Some(profile.linkedPersona) : None,
            })
        }
    }

    async function backupAllRelations() {
        const data = await queryRelations(() => true)
        for (const relation of data) {
            relations.push({
                favor: relation.favor,
                persona: relation.linked,
                profile: relation.profile,
            })
        }
    }
}
