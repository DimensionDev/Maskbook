export interface GroupIdentifier extends Array<string> {
    /** Type */
    0: 'group'
    /** Network */
    1: string
    /** Group id */
    2: string
    /** Define at */
    3: 'remote' | 'local'
    length: 4
}
export interface PersonIdentifier extends Array<string> {
    /** Type */
    0: 'person'
    /** Network */
    1: string
    /** user id */
    2: string
    length: 3
}
export type Identifier = PersonIdentifier | GroupIdentifier
