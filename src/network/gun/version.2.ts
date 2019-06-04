export const Version2Person = '1edc22d2-ca62-4d0a-b842-148f6faa4269'
export const Version2Post = 'd7cc9636-be26-447b-a1bb-798b126f7ace'

interface PersonOnGun {
    proofPostId: string
}
interface PostOnGun {
    /** Keys is a set of PublishedAESKeys without user identifier */
    keys: string[]
}
export interface ApplicationStateInGunVersion2 {
    /**
     * Locate a person
     * Version2Person + sha512_base64(PersonIdentifier)
     *
     * ! If this network is dangerous, then users expect secret distribution, don't write data into this field
     *
     * Locate a post on gun
     * Version2Post + sha512_base64(PostIdentifier)
     * ! If this network is dangerous, then users expect secret distribution, don't write data into this field
     */
    [key: string]: PersonOnGun | PostOnGun
}
