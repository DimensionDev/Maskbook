import { GroupIdentifier, PersonIdentifier, GroupType, PreDefinedVirtualGroupType } from './type'

interface GroupRecordBase {
    /**
     * The creator of the group.
     * Only used for indicate **who** created this virtual group currently
     *
     * It does not indicates admins of the group!
     */
    creator?: PersonIdentifier
    members: PersonIdentifier[]
    /**
     * Ban list of this group.
     * Only used for virtual group currently
     *
     * Used to remember if user clicks
     * > they is not my friend, don't add them to my auto-share list again!
     */
    banned?: PersonIdentifier[]
    /** Index */
    network: string
    groupName: string
}
interface GroupRecordInDatabase extends GroupRecordBase {
    identifier: string
}
export interface GroupRecord extends GroupRecordBase {
    identifier: GroupIdentifier
}
/**
 * This function create a new user group
 * It will return a GroupIdentifier
 * @param network network
 * @param type If type is real, groupID must be an ID on the network
 * If type is virtual, groupID must be a PreDefinedVirtualGroupType, or undefined (which will generate a new ID)
 */
declare function createUserGroupDatabase(
    network: string,
    type: GroupType.real,
    groupID: string,
): Promise<GroupIdentifier>
declare function createUserGroupDatabase(
    network: string,
    type: GroupType.virtual,
    groupID?: PreDefinedVirtualGroupType,
    belongs?: PersonIdentifier,
): Promise<GroupIdentifier>
declare function createUserGroupDatabase(
    network: string,
    type: GroupType,
    groupID?: string | PreDefinedVirtualGroupType,
    belongs?: PersonIdentifier,
): Promise<GroupIdentifier>

/**
 * Delete a user group that stored in the Maskbook
 * @param group Group ID
 */
declare function deleteUserGroupDatabase(group: GroupIdentifier): Promise<void>

/**
 * Update a user group that stored in the Maskbook
 * @param group Group ID
 */
declare function updateUserGroupDatabase(group: Partial<GroupRecord>): Promise<void>

/**
 * Query a user group that stored in the Maskbook
 * @param group Group ID
 */
declare function queryUserGroupDatabase(group: GroupIdentifier): Promise<void>

/**
 * Query user groups that stored in the Maskbook
 * @param group Group ID
 */
declare function queryUserGroupsDatabase(
    query: ((key: GroupIdentifier, record: GroupRecordInDatabase) => boolean) | { network: string },
): Promise<void>
