import { MaskMessage } from '../../../utils/messages'
import type { ProfileIdentifier } from '../../../database/type'
import { queryPostsDB, PostRecord, RecipientReason } from '../../../database/post'
import { currentImportingBackup } from '../../../settings/settings'
import { Services } from '../../service'

interface ShareTarget {
    share: ProfileIdentifier[]
    whoAmI: ProfileIdentifier
    reason: RecipientReason
}

async function appendShare(
    postFilter: Parameters<typeof queryPostsDB>[0],
    shareTargets: (postRec: PostRecord) => ShareTarget,
) {
    const posts = await queryPostsDB(postFilter)
    for (const post of posts) {
        const postID = post.identifier.toText()
        const { share, whoAmI, reason } = shareTargets(post)
        if (share.length === 0) return

        console.log('Sharing post ', postID, '...')
        if (!post.postCryptoKey) {
            console.warn('Post ', postID, ' have no CryptoKey, skipping')
            return
        }

        Services.Crypto.appendShareTarget(-38, post.postCryptoKey, post.identifier.postIV, share, whoAmI, reason).then(
            () => {
                console.log('Post ', postID, ' shared')
            },
            console.error,
        )
    }
}

export default function (signal: AbortSignal) {
    const undo1 = MaskMessage.events.profileJoinedGroup.on(async (data) => {
        if (currentImportingBackup.value) return
        if (data.group.isReal) return
        const group = await Services.UserGroup.queryUserGroup(data.group)
        if (!group) return
        // if (group.groupName !== PreDefinedVirtualGroupNames.friends) return

        const whoAmI = data.group.ownerIdentifier
        if (!whoAmI) return

        console.groupCollapsed(
            '[Auto share to friends] New friends',
            data.newMembers,
            ' to group ',
            data.group,
            ' share old posts to them.',
        )
        appendShare(
            (record, id) => {
                if (id.network !== data.group.network) return false
                if (record.recipientGroups.some((x) => data.group.equals(x))) return true
                return false
            },
            (post) => {
                const notSharedBefore: ProfileIdentifier[] = []
                data.newMembers.forEach((x) => {
                    if (post.recipients.has(x)) {
                    } else notSharedBefore.push(x)
                })
                return {
                    share: notSharedBefore,
                    whoAmI,
                    reason: { type: 'group', at: new Date(), group: group.identifier },
                }
            },
        )
        console.groupEnd()
    })
    const undo2 = MaskMessage.events.linkedProfilesChanged.on(async (events) => {
        if (currentImportingBackup.value) return
        const mine = await Services.Identity.queryMyProfiles()
        for (const e of events) {
            appendShare(
                (rec) => !!e.after && mine.some((q) => rec.postBy.equals(q.identifier)) && rec.recipients.has(e.of),
                (rec) => ({ share: [e.of], whoAmI: rec.postBy, reason: { type: 'auto-share', at: new Date() } }),
            )
        }
    })
    signal.addEventListener('abort', undo1)
    signal.addEventListener('abort', undo2)
}
