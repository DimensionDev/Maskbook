import { GroupIdentifier, PersonIdentifier } from './type'

interface Base<db extends boolean> {
    identifier: IF<db, string, GroupIdentifier>
    /**
     * The creator of the group.
     * Only used for indicate **who** created this virtual group currently
     */
    creator?: IF<db, string, PersonIdentifier>
    members: IF<db, string[], PersonIdentifier[]>
    /**
     * Ban list of this group.
     * Only used for virtual group currently
     *
     * Used to remember if user clicks
     * > they is not my friend, don't add them to my auto-share list again!
     */
    banned: IF<db, string[], PersonIdentifier[]>
}
interface GroupRecordInDatabase extends Base<true> {
    /** Index */
    network: string
    groupName: string
}
export interface GroupRecord extends Omit<GroupRecordInDatabase, keyof Base<true> | 'network'>, Base<false> {}
