import { MessageCenter } from '../../../utils/messages'
import { queryUserGroup } from '../PeopleService'
import { PreDefinedVirtualGroupNames } from '../../../database/type'
import { queryPostsDB } from '../../../database/post'
import { appendShareTarget } from '../CryptoService'

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
            appendShareTarget(
                -38,
                post.postCryptoKey,
                post.identifier.postIV,
                data.newMembers,
                data.group.ownerIdentifier,
                group.identifier,
            ).then(() => {
                console.log('Post ', id, ' shared')
            }, console.error)
        }
        setTimeout(() => console.groupEnd(), 1000)
    })
}
