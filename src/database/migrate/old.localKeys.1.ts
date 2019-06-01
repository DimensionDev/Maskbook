import { deleteDB } from 'idb/with-async-ittr'
import * as People from '../people'
import { getMyLocalKey } from '../../key-management/local-db'

/**
 * ! Migrate old database into new one.
 * ! Scheduled to remove it after Jan/1/2019
 */
export default async function migrate() {
    if (indexedDB.databases) {
        const dbs = await indexedDB.databases()
        if (!dbs.find(x => x.name === 'maskbook-localkeystore-demo-v1')) return
    }
    // tslint:disable-next-line: deprecation
    const key = await getMyLocalKey()
    if (key) People.storeDefaultLocalKeyDB(key.key)
    await deleteDB('maskbook-localkeystore-demo-v1')
}
