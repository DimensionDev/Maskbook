import avatar from './old.avatar.1'
import localKeys from './old.localKeys.1'
import keys from './old.keystore.1'
import createUserGroupForOldUsers from './create.user.group.for.old.users'

createUserGroupForOldUsers()
avatar()
    .finally(() => localKeys())
    .finally(() => keys())
