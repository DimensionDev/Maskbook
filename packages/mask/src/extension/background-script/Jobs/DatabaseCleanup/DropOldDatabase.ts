import { deleteDB } from 'idb/with-async-ittr'
import { noop } from 'lodash-unified'

try {
    deleteDB('maskbook-user-groups').catch(noop)
} catch {}

try {
    deleteDB('maskbook-people-v2').catch(noop)
} catch {}
