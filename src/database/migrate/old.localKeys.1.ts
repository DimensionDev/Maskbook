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
import { OnlyRunInContext } from '@holoflows/kit/es'
import { readMangledDB } from './old.mangled.helper.1'
// tslint:disable: deprecation
OnlyRunInContext('background', 'Local Key Store')
/** DO NOT Change the name of this class! It is used as key in the db! */
class LocalCryptoKeyRecord {
    username!: string
    key!: CryptoKey
}
/**
 * @deprecated
 */
async function getMyLocalKey(): Promise<LocalCryptoKeyRecord | null> {
    const [key] = (await readMangledDB('maskbook-localkeystore-demo-v1', 1)) as LocalCryptoKeyRecord[]
    return key || null
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
