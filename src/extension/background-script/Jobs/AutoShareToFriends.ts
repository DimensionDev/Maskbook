import { MessageCenter } from '../../../utils/messages'
import { PreDefinedVirtualGroupNames, ProfileIdentifier } from '../../../database/type'
import { queryPostsDB } from '../../../database/post'
import { appendShareTarget } from '../CryptoService'
import { queryUserGroup } from '../UserGroupService'

export function initAutoShareToFriends() {
    MessageCenter.on('joinGroup', async data => {
        if (data.group.isReal) return
        const group = await queryUserGroup(data.group)
        if (!group) return
        if (group.groupName !== PreDefinedVirtualGroupNames.friends) return

        const posts = await queryPostsDB((record, id) => {
            if (id.network !== data.group.network) return false
            if (record.recipientGroups.some(x => data.group.equals(x))) return true
            return false
        })

        console.groupCollapsed(
            '[Auto share to friends] New friends',
            data.newMembers,
            ' to group ',
            data.group,
            ' share old posts to them.',
        )
        for (const post of posts) {
            const id = post.identifier.toText()
            console.log('Sharing post ', id, '...')
            if (!post.postCryptoKey) {
                console.warn('Post ', id, ' have no CryptoKey, skipping')
                continue
            }
            const notSharedBefore: ProfileIdentifier[] = []

            data.newMembers.forEach(x => {
                if (post.recipients.has(x)) {
                    // TODO: should also check the published status
                    // skipping
                } else notSharedBefore.push(x)
            })
            const groupOwner = data.group.ownerIdentifier
            if (!groupOwner) return
            appendShareTarget(
                -38,
                post.postCryptoKey,
                post.identifier.postIV,
                notSharedBefore,
                groupOwner,
                group.identifier,
            ).then(() => {
                console.log('Post ', id, ' shared')
            }, console.error)
        }
        console.groupEnd()
    })
}
