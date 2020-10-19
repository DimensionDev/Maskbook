import { OnlyRunInContext } from '@dimensiondev/holoflows-kit/es'

OnlyRunInContext(['background', 'debugging'], 'UserGroupService')
export {
    addProfileToFriendsGroup,
    createDefaultFriendsGroup,
    removeProfileFromFriendsGroup,
    createFriendsGroup,
    queryUserGroups,
} from '../../database/helpers/group'
export { queryUserGroupDatabase as queryUserGroup } from '../../database/group'
