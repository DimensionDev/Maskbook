import { delay } from '@masknet/kit'
import type { NormalizedBackup } from '@masknet/backup-format'
import { activatedPluginsWorker, registeredPlugins } from '@masknet/plugin-infra/background-worker'
import { type PluginID, type ProfileIdentifier, RelationFavor, MaskMessages } from '@masknet/shared-base'
import {
    consistentPersonaDBWriteAccess,
    createOrUpdatePersonaDB,
    createOrUpdateProfileDB,
    createOrUpdateRelationDB,
    type LinkedProfileDetails,
} from '../../database/persona/db.js'
import {
    withPostDBTransaction,
    createPostDB,
    type PostRecord,
    queryPostDB,
    updatePostDB,
} from '../../database/post/index.js'
import type { LatestRecipientDetailDB, LatestRecipientReasonDB } from '../../database/post/dbType.js'
import { internal_wallet_restore } from './internal_wallet_restore.js'

export async function restoreNormalizedBackup(backup: NormalizedBackup.Data) {
    const { plugins, posts, wallets } = backup

    await restorePersonas(backup)
    await restorePosts(posts.values())
    if (wallets.length) {
        await internal_wallet_restore(wallets)
    }
    await restorePlugins(plugins)

    // Note: it looks like the restore will not immediately available to the dashboard, maybe due to
    // serialization cost or indexedDB transaction apply cost?
    // Here we add a delay as a workaround. It increases linearly as the scale of personas and profiles.
    await delay(backup.personas.size + backup.profiles.size)

    if (backup.personas.size || backup.profiles.size) MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
}

async function restorePersonas(backup: NormalizedBackup.Data) {
    const { personas, profiles, relations } = backup

    await consistentPersonaDBWriteAccess(async (t) => {
        const promises: Array<Promise<unknown>> = []
        for (const [id, persona] of personas) {
            for (const [id] of persona.linkedProfiles) {
                const state: LinkedProfileDetails = { connectionConfirmState: 'confirmed' }
                persona.linkedProfiles.set(id, state)
            }

            promises.push(
                createOrUpdatePersonaDB(
                    {
                        identifier: id,
                        publicKey: persona.publicKey,
                        privateKey: persona.privateKey.unwrapOr(undefined),
                        createdAt: persona.createdAt.unwrapOr(undefined),
                        updatedAt: persona.updatedAt.unwrapOr(undefined),
                        localKey: persona.localKey.unwrapOr(undefined),
                        nickname: persona.nickname.unwrapOr(undefined),
                        mnemonic: persona.mnemonic
                            .map((mnemonic) => ({
                                words: mnemonic.words,
                                parameter: { path: mnemonic.path, withPassword: mnemonic.hasPassword },
                            }))
                            .unwrapOr(undefined),
                        linkedProfiles: persona.linkedProfiles as any,
                        // "login" again because this is the restore process.
                        // We need to explicitly set this flag because the backup may already in the database (but marked as "logout").
                        hasLogout: false,
                    },
                    {
                        explicitUndefinedField: 'ignore',
                        linkedProfiles: 'merge',
                    },
                    t,
                ),
            )
        }

        for (const [id, profile] of profiles) {
            promises.push(
                createOrUpdateProfileDB(
                    {
                        identifier: id,
                        nickname: profile.nickname.unwrapOr(undefined),
                        localKey: profile.localKey.unwrapOr(undefined),
                        linkedPersona: profile.linkedPersona.unwrapOr(undefined),
                        createdAt: profile.createdAt.unwrapOr(new Date()),
                        updatedAt: profile.updatedAt.unwrapOr(new Date()),
                    },
                    t,
                ),
            )
        }

        for (const relation of relations) {
            promises.push(
                createOrUpdateRelationDB(
                    {
                        profile: relation.profile,
                        linked: relation.persona,
                        favor: relation.favor,
                    },
                    t,
                ),
            )
        }

        if (!relations.length) {
            for (const persona of personas.values()) {
                if (persona.privateKey.isNone()) continue

                for (const profile of profiles.values()) {
                    promises.push(
                        createOrUpdateRelationDB(
                            {
                                favor: RelationFavor.UNCOLLECTED,
                                linked: persona.identifier,
                                profile: profile.identifier,
                            },
                            t,
                        ),
                    )
                }
            }
        }
        await Promise.all(promises)
    })
}

function restorePosts(backup: Iterable<NormalizedBackup.PostBackup>) {
    return withPostDBTransaction(async (t) => {
        const promises: Array<Promise<unknown>> = []
        for (const post of backup) {
            const rec: PostRecord = {
                identifier: post.identifier,
                foundAt: post.foundAt,
                postBy: post.postBy.unwrapOr(undefined),
                recipients: 'everyone',
            }
            if (post.encryptBy.isSome()) rec.encryptBy = post.encryptBy.value
            if (post.postCryptoKey.isSome()) rec.postCryptoKey = post.postCryptoKey.value
            if (post.summary.isSome()) rec.summary = post.summary.value
            if (post.url.isSome()) rec.url = post.url.value
            if (post.interestedMeta.size) rec.interestedMeta = post.interestedMeta
            if (post.recipients.isSome()) {
                const { value } = post.recipients
                if (value.type === 'public') rec.recipients = 'everyone'
                else {
                    const map = new Map<ProfileIdentifier, LatestRecipientDetailDB>()
                    for (const [id, detail] of value.receivers) {
                        map.set(id, {
                            reason: detail.map((x): LatestRecipientReasonDB => ({ at: x.at, type: 'direct' })),
                        })
                    }
                }
            }

            // TODO: have a createOrUpdatePostDB
            promises.push(
                queryPostDB(post.identifier, t).then((result) =>
                    result ? updatePostDB(rec, 'override', t) : createPostDB(rec, t),
                ),
            )
        }
        await Promise.all(promises)
    })
}
async function restorePlugins(backup: NormalizedBackup.Data['plugins']) {
    const plugins = [...activatedPluginsWorker]
    const works = new Set<Promise<void>>()
    for (const [pluginID, item] of Object.entries(backup)) {
        const plugin = plugins.find((x) => x.ID === pluginID)
        // should we warn user here?
        if (!plugin) {
            if ([...registeredPlugins.getCurrentValue().map((x) => x[0])].includes(pluginID as PluginID))
                console.warn(`[@masknet/plugin-infra] Found a backup of a not enabled plugin ${plugin}`, item)
            else console.warn(`[@masknet/plugin-infra] Found an unknown plugin backup of ${plugin}`, item)
            continue
        }

        const onRestore = plugin.backup?.onRestore
        if (!onRestore) {
            console.warn(
                `[@masknet/plugin-infra] Found a backup of plugin ${plugin.ID} but it did not register a onRestore callback.`,
                item,
            )
            continue
        }
        works.add(
            (async (): Promise<void> => {
                const result = await onRestore(item)
                if (result.isErr()) {
                    const msg = `[@masknet/plugin-infra] Plugin ${plugin.ID} failed to restore its backup.`
                    throw new Error(msg, { cause: result.error })
                }
            })(),
        )
    }
    await Promise.allSettled(works)
}
