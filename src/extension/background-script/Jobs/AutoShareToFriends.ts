import { MessageCenter } from '../../../utils/messages'
import type { PreDefinedVirtualGroupNames, ProfileIdentifier, GroupIdentifier } from '../../../database/type'
import { queryPostsDB, PostRecord, RecipientReason } from '../../../database/post'
import { appendShareTarget } from '../CryptoService'
import { queryUserGroup } from '../UserGroupService'
import { IdentifierMap } from '../../../database/IdentifierMap'
import { queryMyProfiles } from '../IdentityService'
import { currentImportingBackup } from '../../../components/shared-settings/settings'

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

        appendShareTarget(-38, post.postCryptoKey, post.identifier.postIV, share, whoAmI, reason).then(() => {
            console.log('Post ', postID, ' shared')
        }, console.error)
    }
}

export function initAutoShareToFriends() {
    MessageCenter.on('joinGroup', async (data: { group: GroupIdentifier; newMembers: ProfileIdentifier[] }) => {
        if (currentImportingBackup.value) return
        if (data.group.isReal) return
        const group = await queryUserGroup(data.group)
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
    MessageCenter.on('linkedProfileChanged', async (e) => {
        if (currentImportingBackup.value) return
        const mine = await queryMyProfiles()
        appendShare(
            (rec) => !!e.after && mine.some((q) => rec.postBy.equals(q.identifier)) && rec.recipients.has(e.of),
            (rec) => ({ share: [e.of], whoAmI: rec.postBy, reason: { type: 'auto-share', at: new Date() } }),
        )
    })
}
