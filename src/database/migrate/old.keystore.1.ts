import { deleteDB } from 'idb/with-async-ittr'
import * as People from '../people'
import { queryPeopleCryptoKey } from '../../key-management/keystore-db'
import { PersonIdentifier } from '../type'

/**
 * ! Migrate old database into new one.
 * ! Scheduled to remove it after May/31/2019
 */
export default async function migrate() {
    if (indexedDB.databases) {
        const dbs = await indexedDB.databases()
        if (!dbs.find(x => x.name === 'maskbook-keystore-demo-v2')) return
    }
    // tslint:disable-next-line: deprecation
    const wait = (await queryPeopleCryptoKey()).map(record => {
        if (record.username === '$self')
            return People.storeMyIdentityDB({
                // TODO: Need to update later !
                identifier: new PersonIdentifier('facebook.com', '$self'),
                groups: [],
                relation: [],
                relationLastCheckTime: new Date(),
                publicKey: record.publicKey,
                privateKey: record.privateKey!,
            })
        else
            return People.storeNewPersonDB({
                identifier: new PersonIdentifier('facebook.com', record.username),
                publicKey: record.publicKey,
                groups: [],
                relation: [],
                relationLastCheckTime: new Date('May 1 2019'),
            })
    })
    await Promise.all(wait)
    await deleteDB('maskbook-keystore-demo-v2')
}
