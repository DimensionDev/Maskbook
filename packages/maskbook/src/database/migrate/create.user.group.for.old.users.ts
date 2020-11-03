import { queryUserGroupDatabase } from '../group'
import { GroupIdentifier } from '../type'
import { createDefaultFriendsGroup } from '../helpers/group'
import { queryMyProfiles } from '../../extension/background-script/IdentityService'

/**
 * If an identity has no default user group, create one
 */
export default async function createUserGroupForOldUsers() {
    const ids = await queryMyProfiles()
    for (const id of ids) {
        const g = await queryUserGroupDatabase(GroupIdentifier.getDefaultFriendsGroupIdentifier(id.identifier))
        if (!g) createDefaultFriendsGroup(id.identifier)
    }
}
