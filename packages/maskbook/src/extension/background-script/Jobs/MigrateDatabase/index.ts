import createUserGroupForOldUsers from './create.user.group.for.old.users'
import { sideEffect, untilDocumentReady } from '../../../../utils'

sideEffect.then(untilDocumentReady).then(run)
function run() {
    createUserGroupForOldUsers()
}
