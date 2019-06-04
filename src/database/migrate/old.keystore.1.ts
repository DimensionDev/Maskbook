/**
 * @deprecated
 * ! This version of database is deprecated
 * ! Don't use it.
 *
 * ! Scheduled to remove it after May/31/2019
 * ! This database should be readonly now.
 */
import { Entity, Index, Db, Key } from 'typed-db'
import { OnlyRunInContext } from '@holoflows/kit/es'
// tslint:disable: deprecation
OnlyRunInContext('background', 'Key Store')
@Entity()
/** DO NOT Change the name of this class! It is used as key in the db! */
class CryptoKeyRecord {
    @Index({ unique: true })
    @Key()
    username!: string
    key!: { publicKey: JsonWebKey; privateKey?: JsonWebKey }
    algor!: any
    usages!: string[]
}
// ! This keystore is not stable and maybe drop in the future!

type Exporting = {
    username: string
    publicKey: CryptoKey
    privateKey?: CryptoKey
}
/**
 * @deprecated
 */
async function queryPeopleCryptoKey(): Promise<Exporting[]> {
    async function toReadCryptoKey(y: CryptoKeyRecord): Promise<Exporting> {
        const pub = await crypto.subtle.importKey('jwk', y.key.publicKey, y.algor, true, y.usages)
        let priv: CryptoKey | undefined = undefined
        if (y.key.privateKey) priv = await crypto.subtle.importKey('jwk', y.key.privateKey, y.algor, true, y.usages)
        return {
            username: y.username,
            publicKey: pub,
            privateKey: priv,
        }
    }
    const query = buildQuery(new Db('maskbook-keystore-demo-v2', 1), CryptoKeyRecord)
    const record = await query(t => t.openCursor().asList())
    return Promise.all(record.map(toReadCryptoKey))
}
//#region Store & Read CryptoKey
//#endregion

//#region Generate a new private key

/**
 * @deprecated
 */
async function generateNewKey(whoami: PersonIdentifier): Promise<People.PersonRecordPublicPrivate> {
    const has = await People.queryMyIdentityAtDB(whoami)
    if (has) throw new TypeError('You already have a key-pair!')

    const mine = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])
    const record: People.PersonRecordPublicPrivate = {
        identifier: whoami,
        groups: [],
        publicKey: mine.publicKey,
        privateKey: mine.privateKey,
        relation: [],
        relationLastCheckTime: new Date(),
    }
    await People.storeMyIdentityDB(record)
    return record
}
//#endregion

import { deleteDB } from 'idb/with-async-ittr'
import * as People from '../people'
import { PersonIdentifier } from '../type'
import { buildQuery } from '../../utils/utils'

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
