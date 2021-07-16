import createUserGroupForOldUsers from './create.user.group.for.old.users'
import fixQrPrivateKeyBug from './fix.qr.private.key.bug'
import migratePeopleToPersona from './people.to.persona'
import { sideEffect, untilDocumentReady } from '../../../../utils'

sideEffect.then(untilDocumentReady).then(run)
function run() {
    createUserGroupForOldUsers()
    migratePeopleToPersona()
    fixQrPrivateKeyBug()
}
