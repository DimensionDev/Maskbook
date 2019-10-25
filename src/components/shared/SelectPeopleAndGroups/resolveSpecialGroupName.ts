import { PreDefinedVirtualGroupNames, GroupIdentifier } from '../../../database/type'
import { Group, Person } from '../../../database'
import { useFriendsList, useMyIdentities } from '../../DataSource/useActivatedUI'
import { geti18nString } from '../../../utils/i18n'

function resolveSpecialGroupName(group: Group, knownPeople: Person[]): string {
    if (group.groupName === PreDefinedVirtualGroupNames.friends) {
        let owner: string = group.identifier.virtualGroupOwner || 'Unknown'

        for (const person of knownPeople.filter(x => x.identifier.equals(group.identifier.ownerIdentifier))) {
            owner = person.nickname || owner
        }
        return geti18nString('database_group_friends_default_name', owner)
    }
    return group.groupName
}

export function useResolveSpecialGroupName(group: Group | Person) {
    const x = useFriendsList()
    const y = useMyIdentities()
    if (!isGroup(group)) return ''
    return resolveSpecialGroupName(group, [...x, ...y])
}
function isGroup(group: Group | Person): group is Group {
    return group.identifier instanceof GroupIdentifier
}
