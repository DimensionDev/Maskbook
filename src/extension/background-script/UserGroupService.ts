import { OnlyRunInContext } from '@holoflows/kit/es'

OnlyRunInContext('background', 'UserGroupService')
export {
    addProfileToFriendsGroup,
    createDefaultFriendsGroup,
    removeProfileFromFriendsGroup,
    queryUserGroups,
} from '../../database/helpers/group'
export { queryUserGroupDatabase as queryUserGroup } from '../../database/group'
