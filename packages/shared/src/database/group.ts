import type { GroupIdentifier, ProfileIdentifier } from '..'

export interface GroupRecordBase {
    groupName: string
}

export interface GroupRecord extends GroupRecordBase {
    identifier: GroupIdentifier
    members: ProfileIdentifier[]
    banned?: ProfileIdentifier[]
}
