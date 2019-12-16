import { GroupRecord } from '../../../../../database/group'
import { BackupJSONFileLatest } from '../latest'

export function GroupRecordToJSONFormat(group: GroupRecord): BackupJSONFileLatest['userGroups'][0] {
    return {
        groupName: group.groupName,
        identifier: group.identifier.toText(),
        members: group.members.map(x => x.toText()),
        banned: group.banned?.map(x => x.toText()),
    }
}
