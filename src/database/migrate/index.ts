import createUserGroupForOldUsers from './create.user.group.for.old.users'
import migratePeopleToPersona from './people.to.persona'
import { untilDocumentReady } from '../../utils/dom'

untilDocumentReady().then(run)
function run() {
    createUserGroupForOldUsers()
    migratePeopleToPersona()
}
