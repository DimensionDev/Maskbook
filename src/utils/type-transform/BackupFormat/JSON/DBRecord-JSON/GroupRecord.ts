import { GroupRecord } from '../../../../../database/group'
import { BackupJSONFileLatest } from '../latest'
import { Identifier, GroupIdentifier, ProfileIdentifier } from '../../../../../database/type'

export function GroupRecordToJSONFormat(group: GroupRecord): BackupJSONFileLatest['userGroups'][0] {
    return {
        groupName: group.groupName,
        identifier: group.identifier.toText(),
        members: group.members.map(x => x.toText()),
        banned: group.banned?.map(x => x.toText()),
    }
}

export function GroupRecordFromJSONFormat(group: BackupJSONFileLatest['userGroups'][0]): GroupRecord {
    return {
        groupName: group.groupName,
        identifier: Identifier.fromString(group.identifier, GroupIdentifier).unwrap('Cast failed'),
        members: group.members.map(x => Identifier.fromString(x, ProfileIdentifier).unwrap('Cast failed')),
        banned: group.banned?.map(x => Identifier.fromString(x, ProfileIdentifier).unwrap('Cast failed')),
    }
}
