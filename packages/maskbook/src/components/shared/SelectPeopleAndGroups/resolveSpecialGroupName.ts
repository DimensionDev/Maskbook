import { useI18N, I18NFunction, I18NStrings } from '../../../utils'
import { PreDefinedVirtualGroupNames, GroupIdentifier } from '../../../database/type'
import type { Group, Profile } from '../../../database'
import { useFriendsList, useMyIdentities } from '../../DataSource/useActivatedUI'

function resolveSpecialGroupName(t: I18NFunction, group: Group, knownPeople: Profile[]): string {
    let owner: string = group.identifier.virtualGroupOwner || 'Unknown'

    for (const profile of knownPeople.filter((x) => x.identifier.equals(group.identifier.ownerIdentifier))) {
        owner = profile.linkedPersona?.nickname || profile.nickname || owner
    }
    const data = { owner }
    switch (group.groupName) {
        case PreDefinedVirtualGroupNames.friends:
            return t('database_group_friends_default_name', data)
        case PreDefinedVirtualGroupNames.followers:
            return t('database_group_followers_name', data)
        case PreDefinedVirtualGroupNames.following:
            return t('database_group_following_name', data)
        default:
            return t(group.groupName as keyof I18NStrings, data)
    }
}

export function useResolveSpecialGroupName(group: Group | Profile) {
    const { t } = useI18N()
    const x = useFriendsList()
    const y = useMyIdentities()
    if (!isGroup(group)) return ''
    return resolveSpecialGroupName(t, group, [...x, ...y])
}
function isGroup(group: Group | Profile): group is Group {
    return group.identifier instanceof GroupIdentifier
}
