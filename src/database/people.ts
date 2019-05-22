import { GroupIdentifier, PersonIdentifier } from './type'

enum Relation {
    /**
     * Due to technical reasons,
     * if program cannot automatically verify the friendship or non-friendship,
     * use this level.
     */
    unknown = 'unknown',
    /**
     * I banned this person.
     * (Only available on some social networks)
     */
    IBanned = 'I banned',
    /**
     * This person bans me.
     * (Only available on some social networks)
     */
    IAmBanned = 'I am banned',
    /** I am following this person. So their post can appear in my timeline. */
    following = 'following',
    /** This person follows me. So my post can appear in their timeline. */
    followed = 'followed',
}
export interface PersonRecord {
    identifier: PersonIdentifier
    nickname: string
    relation: Relation[]
    /** Last check time of relation */
    relationLastCheckTime: Date
    cryptoKey: JsonWebKey | null
    groups: GroupIdentifier[]
}

export async function storeNewPersonDB(record: PersonRecord) {}
export async function queryPersonDB(id: GroupIdentifier) {}
export async function updatePersonDB(person: Partial<PersonRecord> & Pick<PersonRecord, 'identifier'>) {}
