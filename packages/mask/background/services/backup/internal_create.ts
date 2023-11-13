import { None, Some } from 'ts-results-es'
import { timeout } from '@masknet/kit'
import type { PersonaIdentifier } from '@masknet/shared-base'
import { activatedPluginsWorker, type Plugin } from '@masknet/plugin-infra/background-worker'
import { createEmptyNormalizedBackup, type NormalizedBackup } from '@masknet/backup-format'
import { queryPersonasDB, queryProfilesDB, queryRelations } from '../../database/persona/db.js'
import { queryPostsDB } from '../../database/post/index.js'
import { internal_wallet_backup } from './internal_wallet_backup.js'

/** @internal */
interface InternalBackupOptions {
    hasPrivateKeyOnly?: boolean
    noPosts?: boolean
    noWallets?: boolean
    noPersonas?: boolean
    noProfiles?: boolean
    onlyForPersona?: PersonaIdentifier
    allProfile?: boolean
    maskVersion?: string
}
/**
 * @internal
 * DO NOT expose this function as a service.
 */
// TODO: use a single readonly transaction in this operation.
export async function createNewBackup(options: InternalBackupOptions): Promise<NormalizedBackup.Data> {
    const { noPersonas, noPosts, noProfiles, noWallets, onlyForPersona, allProfile } = options
    const file = createEmptyNormalizedBackup()
    const { meta, personas, posts, profiles, relations, settings } = file

    meta.version = 2
    meta.maskVersion = Some(options.maskVersion || '>=2.21.0')
    meta.createdAt = Some(new Date())

    settings.grantedHostPermissions = (await browser.permissions.getAll()).origins || []

    await Promise.allSettled([
        noPersonas || backupPersonas(onlyForPersona ? [onlyForPersona] : undefined),
        noProfiles || backupProfiles(onlyForPersona, allProfile),
        (noPersonas && noProfiles) || backupAllRelations(),
        noPosts || backupPosts(),
        noWallets || internal_wallet_backup().then((w) => (file.wallets = w)),
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
                mnemonic:
                    persona.mnemonic ?
                        Some({
                            hasPassword: persona.mnemonic.parameter.withPassword,
                            path: persona.mnemonic.parameter.path,
                            words: persona.mnemonic.words,
                        })
                    :   None,
                linkedProfiles: persona.linkedProfiles,
                address: persona.address ? Some(persona.address) : None,
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
                postBy: post.postBy ? Some(post.postBy) : None,
                encryptBy: post.encryptBy ? Some(post.encryptBy) : None,
                postCryptoKey: post.postCryptoKey ? Some(post.postCryptoKey) : None,
                summary: post.summary ? Some(post.summary) : None,
                url: post.url ? Some(post.url) : None,
                recipients: Some(recipients),
            })
        }
    }

    async function backupProfiles(of?: PersonaIdentifier, all = false) {
        const data = await queryProfilesDB({
            hasLinkedPersona: !all,
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

        async function backup(plugin: Plugin.Worker.Definition): Promise<void> {
            const backupCreator = plugin.backup?.onBackup
            if (!backupCreator) return

            async function backupPlugin() {
                const result = await timeout(backupCreator!(), 60 * 1000, 'Timeout to backup creator.')
                if (result.isNone()) return
                // We limit the plugin contributed backups must be simple objects.
                // We may allow plugin to store binary if we're moving to binary backup format like MessagePack.
                plugins[plugin.ID] = result.map(JSON.stringify).map(JSON.parse).value
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
