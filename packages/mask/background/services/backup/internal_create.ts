import { createEmptyNormalizedBackup, NormalizedBackup } from '@masknet/backup-format'
import type { PersonaIdentifier } from '@masknet/shared-base'
import { None, Some } from 'ts-results'
import { queryPersonasDB, queryProfilesDB, queryRelations } from '../../database/persona/db'
import { queryPostsDB } from '../../database/post'
import { timeout } from '@dimensiondev/kit'
import { activatedPluginsWorker } from '@masknet/plugin-infra/background-worker'

// Well, this is a bit of a hack, because we have not move those two parts into this project yet.
let backupWallets: () => Promise<NormalizedBackup.WalletBackup[]>
export function delegateWalletBackup(f: typeof backupWallets) {
    backupWallets = f
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
                    receivers: new Map(),
                }
                for (const [recipient, date] of post.recipients) {
                    recipients.receivers.set(recipient, [{ at: date, type: 'direct' }])
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
                if (profile.linkedPersona !== of) continue
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

    async function backupPlugins() {
        const plugins = Object.create(null) as Record<string, unknown>
        const allPlugins = [...activatedPluginsWorker]

        async function backup(plugin: typeof allPlugins[0]): Promise<void> {
            const backupCreator = plugin.backup?.onBackup
            if (!backupCreator) return

            async function backupPlugin() {
                const result = await timeout(backupCreator!(), 3000)
                if (result.none) return
                // We limit the plugin contributed backups must be simple objects.
                // We may allow plugin to store binary if we're moving to binary backup format like MessagePack.
                plugins[plugin.ID] = result.map(JSON.stringify).map(JSON.parse).val
            }
            if (process.env.NODE_ENV === 'development') return backupPlugin()
            return backupPlugin().catch((error) =>
                console.error(`[@masknet/plugin-infra] Plugin ${plugin.ID} failed to backup`, error),
            )
        }

        await Promise.all(allPlugins.map(backup))
        return plugins
    }
}
