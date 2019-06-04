/**
 * @deprecated
 * ! This version of database is deprecated
 * ! Don't use it.
 *
 * ! Scheduled to remove it after Jan/1/2019
 * ! This database should be readonly now.
 */
import { deleteDB } from 'idb/with-async-ittr'
import * as People from '../people'
import { Entity, Index, Db, Key } from 'typed-db'
import { OnlyRunInContext } from '@holoflows/kit/es'
import { buildQuery } from '../../utils/utils'

OnlyRunInContext('background', 'Local Key Store')
@Entity()
/** DO NOT Change the name of this class! It is used as key in the db! */
class LocalCryptoKeyRecord {
    @Index({ unique: true })
    @Key()
    username!: string
    key!: CryptoKey
}
/**
 * @deprecated
 */
async function getMyLocalKey(): Promise<LocalCryptoKeyRecord | null> {
    // tslint:disable-next-line: deprecation
    const query = buildQuery(new Db('maskbook-localkeystore-demo-v1', 1), LocalCryptoKeyRecord)
    const record = await query(t => t.get('$self'))
    if (!record) return null
    return record
}

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
