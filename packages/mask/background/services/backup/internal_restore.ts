import { delay } from '@dimensiondev/kit'
import type { NormalizedBackup } from '@masknet/backup-format'
import { ProfileIdentifier, RelationFavor } from '@masknet/shared-base'
import { MaskMessages } from '../../../shared/messages'
import {
    consistentPersonaDBWriteAccess,
    createOrUpdatePersonaDB,
    createOrUpdateProfileDB,
    createOrUpdateRelationDB,
    LinkedProfileDetails,
} from '../../database/persona/db'
import { withPostDBTransaction, createPostDB, PostRecord, queryPostDB, updatePostDB } from '../../database/post'
import type { LatestRecipientDetailDB, LatestRecipientReasonDB } from '../../database/post/dbType'

// Well, this is a bit of a hack, because we have not move those two parts into this project yet.
// TODO: MV3 support
let restorePlugins: (backup: NormalizedBackup.Data['plugins']) => Promise<void>
let restoreWallets: (backup: NormalizedBackup.WalletBackup[]) => Promise<void>
export function delegateWalletRestore(f: typeof restoreWallets) {
    restoreWallets = f
}
export function delegatePluginRestore(f: typeof restorePlugins) {
    restorePlugins = f
}
export async function restoreNormalizedBackup(backup: NormalizedBackup.Data) {
    const { plugins, posts, wallets } = backup

    {
        const tag = `[Backup] Restore ${backup.personas.size} personas, ${backup.profiles.size} profiles, ${backup.relations.length} relations`
        await restorePersonas(backup)
    }

    {
        const tag = `[Backup] Restore ${backup.posts.size} posts`
        await restorePosts(posts.values())
    }
    if (process.env.manifest === '2') {
        if (wallets.length) {
            await restoreWallets(wallets)
        }
        await restorePlugins(plugins)
    }

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
                        linkedProfiles: persona.linkedProfiles as Map<ProfileIdentifier, unknown> as any,
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
                if (persona.privateKey.none) continue

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
                postBy: post.postBy,
                recipients: 'everyone',
            }
            if (post.encryptBy.some) rec.encryptBy = post.encryptBy.val
            if (post.postCryptoKey.some) rec.postCryptoKey = post.postCryptoKey.val
            if (post.summary.some) rec.summary = post.summary.val
            if (post.url.some) rec.url = post.url.val
            if (post.interestedMeta.size) rec.interestedMeta = post.interestedMeta
            if (post.recipients.some) {
                const { val } = post.recipients
                if (val.type === 'public') rec.recipients = 'everyone'
                else {
                    const map = new Map<ProfileIdentifier, LatestRecipientDetailDB>()
                    for (const [id, detail] of val.receivers) {
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
