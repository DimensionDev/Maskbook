/**
 * @deprecated
 * ! This version of database is deprecated
 * ! Don't use it.
 *
 * ! Scheduled to remove it after Jan/1/2019
 * ! This database should be readonly now.
 */
/* eslint import/no-deprecated: 0 */
import { readMangledDB } from './old.mangled.helper.1'
import { PersonIdentifier } from '../type'
import { deleteDB } from 'idb/with-async-ittr'
import * as Avatar from '../avatar'
import * as People from '../people'

class AvatarRecord {
    username!: string
    nickname!: string
    avatar!: ArrayBuffer
    lastUpdateTime!: Date
}

/**
 * @deprecated
 */
async function queryAvatarData() {
    return readMangledDB('maskbook-avatar-store', 1) as Promise<AvatarRecord[]>
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
    // eslint-disable-next-line import/no-deprecated
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
