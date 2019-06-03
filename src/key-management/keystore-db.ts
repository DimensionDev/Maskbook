/**
 * @deprecated
 * ! This version of database is deprecated
 * ! Don't use it.
 *
 * ! Scheduled to remove it after May/31/2019
 * ! This database should be readonly now.
 */
import { Entity, Index, Db, Key } from 'typed-db'
import { buildQuery } from '../utils/utils'
import { OnlyRunInContext } from '@holoflows/kit/es'
import { PersonIdentifier } from '../database/type'
import { queryMyIdentityAtDB, storeMyIdentityDB, PersonRecordPublicPrivate } from '../database/people'
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
async function generateNewKey(whoami: PersonIdentifier): Promise<PersonRecordPublicPrivate> {
    const has = await queryMyIdentityAtDB(whoami)
    if (has) throw new TypeError('You already have a key-pair!')

    const mine = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])
    const record: PersonRecordPublicPrivate = {
        identifier: whoami,
        groups: [],
        publicKey: mine.publicKey,
        privateKey: mine.privateKey,
        relation: [],
        relationLastCheckTime: new Date(),
    }
    await storeMyIdentityDB(record)
    return record
}
//#endregion
