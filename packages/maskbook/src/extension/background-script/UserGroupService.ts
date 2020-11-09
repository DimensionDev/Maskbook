import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
assertEnvironment(Environment.ManifestBackground)

export {
    addProfileToFriendsGroup,
    createDefaultFriendsGroup,
    removeProfileFromFriendsGroup,
    createFriendsGroup,
    queryUserGroups,
} from '../../database/helpers/group'
export { queryUserGroupDatabase as queryUserGroup } from '../../database/group'
