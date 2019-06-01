import { queryAvatarDataDeprecated } from '../../key-management/avatar-db'
import { PersonIdentifier, Relation } from '../type'
import { deleteDB } from 'idb/with-async-ittr'
import * as Avatar from '../avatar'
import * as People from '../people'

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
/**
 * ! Migrate old database into new one.
 * ! Scheduled to remove it after Jan/1/2019
 */
export default async function migrate() {
    if (indexedDB.databases) {
        const dbs = await indexedDB.databases()
        if (!dbs.find(x => x.name === 'maskbook-avatar-store')) return
    }
    const promises: Promise<unknown>[] = []
    // tslint:disable-next-line: deprecation
    for (const record of await queryAvatarDataDeprecated()) {
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
