/**
 * @deprecated
 * ! This version of database is deprecated
 * ! Don't use it.
 *
 * ! Scheduled to remove it after Jan/1/2019
 * ! This database should be readonly now.
 */
import { PersonIdentifier, Relation } from '../type'
import { deleteDB } from 'idb/with-async-ittr'
import * as Avatar from '../avatar'
import * as People from '../people'

import { Entity, Index, Db } from 'typed-db'
import { buildQuery } from '../../utils/utils'

@Entity()
class AvatarRecord {
    @Index({ unique: true })
    username!: string
    nickname!: string
    avatar!: ArrayBuffer
    lastUpdateTime!: Date
}

/**
 * @deprecated
 */
async function queryAvatarData() {
    // tslint:disable-next-line: deprecation
    const query = buildQuery(new Db('maskbook-avatar-store', 1), AvatarRecord)
    const record = await query(t => t.openCursor().asList())
    return record
}
const cache = new Map<string, string>()
/**
 * @deprecated
 */
async function toDataUrl(x: ArrayBuffer, username?: string): Promise<string> {
    function ArrayBufferToBase64(buffer: ArrayBuffer) {
        const f = new Blob([buffer], { type: 'image/png' })
        const fr = new FileReader()
        return new Promise<string>(resolve => {
            fr.onload = () => resolve(fr.result as string)
            fr.readAsDataURL(f)
        })
    }
    const createAndStore = async () => {
        const u = await ArrayBufferToBase64(x)
        cache.set(username || '$', u)
        return u
    }
    if (username) return cache.get(username) || createAndStore()
    return createAndStore()
}

async function updatePartialPersonRecord(...args: Parameters<typeof People.updatePersonDB>) {
    const id = args[0].identifier
    if (await People.queryPersonDB(id)) {
        await People.updatePersonDB(...args)
    } else {
        await People.storeNewPersonDB({
            groups: [],
            identifier: id,
            nickname: '',
            relation: [Relation.unknown],
            relationLastCheckTime: new Date('May 15 2019'),
            ...args[0],
        })
    }
}

export default async function migrate() {
    if (indexedDB.databases) {
        const dbs = await indexedDB.databases()
        if (!dbs.find(x => x.name === 'maskbook-avatar-store')) return
    }
    const promises: Promise<unknown>[] = []
    // tslint:disable-next-line: deprecation
    for (const record of await queryAvatarData()) {
        const person = new PersonIdentifier('facebook.com', record.username)
        promises.push(
            Avatar.storeAvatarDB(person, record.avatar),
            Avatar.updateAvatarMetaDB(person, {
                lastAccessTime: record.lastUpdateTime,
                lastUpdateTime: record.lastUpdateTime,
            }),
            record.nickname
                ? updatePartialPersonRecord({
                      identifier: person,
                      nickname: record.nickname,
                  })
                : Promise.resolve(),
        )
    }
    const errors: Error[] = []
    for (const promise of promises) {
        try {
            await promise
        } catch (e) {
            errors.push(e)
        }
    }
    if (errors.length)
        console.error('Migrating database maskbook-avatar-store to maskbook-avatar-cache with errors', ...errors)
    await deleteDB('maskbook-avatar-store')
}
