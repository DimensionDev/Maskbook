import { GroupRecord, createUserGroupDatabase } from '../group'
import { PersonIdentifier, GroupIdentifier, PreDefinedVirtualGroupNames, GroupType } from '../type'

export interface Group extends GroupRecord {
    avatar?: string
}

export function createDefaultFriendsGroup(who: PersonIdentifier) {
    return createUserGroupDatabase(
        GroupIdentifier.getDefaultFriendsGroupIdentifier(who),
        // Put the raw special name in, then UI can display in their own language.
        PreDefinedVirtualGroupNames.friends,
    )
}
