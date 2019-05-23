import { GroupIdentifier, Relation, PersonIdentifier, Identifier, PostIdentifier } from './type'
import { openDB, DBSchema } from 'idb/with-async-ittr'

interface PersonDBRecord {
    identifier: PersonIdentifier
    previousIdentifiers: string[]
    nickname: string
    relation: Relation[]
    /** Last check time of relation */
    relationLastCheckTime: Date
    cryptoKey: JsonWebKey | null
    groups: GroupIdentifier[]
}
interface PeopleDB extends DBSchema {
    /** Use inline keys */
    people: {
        value: PersonDBRecord
        key: string
    }
}
const db = openDB<PeopleDB>('maskbook-people-v2', 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
        // inline keys
        db.createObjectStore('people', { keyPath: 'identifier' })
    },
})
export async function storeNewPersonDB(record: PersonDBRecord) {
    const t = (await db).transaction('people', 'readwrite')
    const o: typeof record = { ...record, identifier: record.identifier.toString() as any }
    await t.objectStore('people').put(o)
    return
}
export async function queryPersonDB(id: PersonIdentifier) {
    if (id.network === 'localhost') throw new TypeError('')
    const t = (await db).transaction('people', 'readonly')
    const result = await t.objectStore('people').get(id.toString())
    if (!result) return null
    result.identifier = Identifier.fromString(result.identifier)
    return result
}
export async function updatePersonDB(person: Partial<PersonDBRecord> & Pick<PersonDBRecord, 'identifier'>) {
    const t = (await db).transaction('people', 'readwrite')
    const full = await t.objectStore('people').get(person.identifier.toString())
    if (!full) throw new Error('Person is not in the db')
    const o: PersonDBRecord = { ...full, ...person }
    o.identifier = person.identifier.toString() as any
    await t.objectStore('people').put(o)
}
export async function removePersonDB(people: PostIdentifier[]) {
    const t = (await db).transaction('people', 'readwrite')
    for (const person of people) await t.objectStore('people').delete(person.toString())
    return
}
