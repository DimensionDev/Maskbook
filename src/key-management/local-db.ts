/**
 * @deprecated
 * ! This version of database is deprecated
 * ! Don't use it.
 *
 * ! Scheduled to remove it after Jan/1/2019
 * ! This database should be readonly now.
 */
import { Entity, Index, Db, Key } from 'typed-db'
import { buildQuery } from '../utils/utils'
import { OnlyRunInContext } from '@holoflows/kit/es'

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
export async function getMyLocalKey(): Promise<LocalCryptoKeyRecord | null> {
    const query = buildQuery(new Db('maskbook-localkeystore-demo-v1', 1), LocalCryptoKeyRecord)
    const record = await query(t => t.get('$self'))
    if (!record) return null
    return record
}
