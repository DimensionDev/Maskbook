import { queryUserGroupDatabase } from '../../../../database/group'
import { GroupIdentifier } from '@masknet/shared'
import { createDefaultFriendsGroup } from '../../UserGroupService'
import { queryMyProfiles } from '../../IdentityService'

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
