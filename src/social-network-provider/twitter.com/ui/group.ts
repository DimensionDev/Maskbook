import { SocialNetworkUI } from '../../../social-network/ui'
import { MessageCenter } from '../../../utils/messages'
import Services from '../../../extension/service'
import { PersonIdentifier } from '../../../database/type'

export const PreDefinedTwitterGroupNames = {
    followers: 'database_group_followers_name',
    following: 'database_group_following_name',
}

export function InitTwitterGroups(self: SocialNetworkUI) {
    MessageCenter.on('identityCreated', async () => {
        const myIdentities = await Services.People.queryMyIdentity(self.networkIdentifier)
        const myIdentity = myIdentities[0] || PersonIdentifier.unknown
        for (const [_, groupId] of Object.entries(PreDefinedTwitterGroupNames)) {
            Services.People.createFriendsGroup(myIdentity.identifier, groupId).catch(console.error)
        }
    })
}
