import { PreDefinedVirtualGroupNames, GroupIdentifier } from '../../../database/type'
import { Group, Profile } from '../../../database'
import { useFriendsList, useMyIdentities } from '../../DataSource/useActivatedUI'
import { geti18nString, I18NStrings } from '../../../utils/i18n'

function resolveSpecialGroupName(group: Group, knownPeople: Profile[]): string {
    let owner: string = group.identifier.virtualGroupOwner || 'Unknown'

    for (const person of knownPeople.filter(x => x.identifier.equals(group.identifier.ownerIdentifier))) {
        owner = person.nickname || owner
    }
    switch (group.groupName) {
        case PreDefinedVirtualGroupNames.friends:
            return geti18nString('database_group_friends_default_name', owner)
        case PreDefinedVirtualGroupNames.followers:
            return geti18nString('database_group_followers_name', owner)
        case PreDefinedVirtualGroupNames.following:
            return geti18nString('database_group_following_name', owner)
        default:
            return geti18nString(group.groupName as keyof I18NStrings, owner)
    }
}

export function useResolveSpecialGroupName(group: Group | Profile) {
    const x = useFriendsList()
    const y = useMyIdentities()
    if (!isGroup(group)) return ''
    return resolveSpecialGroupName(group, [...x, ...y])
}
function isGroup(group: Group | Profile): group is Group {
    return group.identifier instanceof GroupIdentifier
}
