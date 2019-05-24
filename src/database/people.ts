import { Relation, PersonIdentifier, Identifier, PostIdentifier, GroupIdentifier } from './type'
import { openDB, DBSchema } from 'idb/with-async-ittr'

function outDb(db: PersonDBRecord): PersonOutDBRecord {
    const { identifier, ...rest } = db
    // Restore prototype
    rest.previousIdentifiers.forEach(y => Object.setPrototypeOf(y, PersonIdentifier.prototype))
    rest.groups.forEach(y => Object.setPrototypeOf(y, GroupIdentifier.prototype))
    return {
        ...rest,
        identifier: Identifier.fromString(identifier) as PersonIdentifier,
    }
}
function toDb(out: PersonOutDBRecord): PersonDBRecord {
    return { ...out, identifier: out.identifier.toString() }
}
interface PersonOutDBRecord extends Omit<PersonDBRecord, 'identifier'> {
    identifier: PersonIdentifier
}
interface PersonDBRecord {
    identifier: string
    previousIdentifiers: PersonIdentifier[]
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
export async function storeNewPersonDB(record: PersonOutDBRecord): Promise<void> {
    const t = (await db).transaction('people', 'readwrite')
    await t.objectStore('people').put(toDb(record))
    return
}
export async function queryPersonDB(id: PersonIdentifier): Promise<null | PersonOutDBRecord> {
    if (id.network === 'localhost') throw new TypeError('')
    const t = (await db).transaction('people', 'readonly')
    const result = await t.objectStore('people').get(id.toString())
    if (!result) return null
    return outDb(result)
}
export async function updatePersonDB(
    person: Partial<PersonOutDBRecord> & Pick<PersonOutDBRecord, 'identifier'>,
): Promise<void> {
    const t = (await db).transaction('people', 'readwrite')
    const full = await t.objectStore('people').get(person.identifier.toString())
    if (!full) throw new Error('Person is not in the db')
    const o: PersonDBRecord = { ...full, ...toDb(person as PersonOutDBRecord) }
    await t.objectStore('people').put(o)
}
export async function removePersonDB(people: PostIdentifier[]): Promise<void> {
    const t = (await db).transaction('people', 'readwrite')
    for (const person of people) await t.objectStore('people').delete(person.toString())
    return
}
