import { queryUserGroupDatabase } from '../group'
import { getMyIdentitiesDB } from '../people'
import { GroupIdentifier } from '../type'
import { createDefaultFriendsGroup } from '../helpers/group'

/**
 * If an identity has no default user group, create one
 */
export default async function createUserGroupForOldUsers() {
    const ids = await getMyIdentitiesDB()
    for (const id of ids) {
        const g = await queryUserGroupDatabase(GroupIdentifier.getDefaultFriendsGroupIdentifier(id.identifier))
        if (!g) createDefaultFriendsGroup(id.identifier)
    }
}
