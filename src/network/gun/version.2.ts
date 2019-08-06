export const Version2Person = '1edc22d2-ca62-4d0a-b842-148f6faa4269'
export const Version2Post = 'd7cc9636-be26-447b-a1bb-798b126f7ace'
import Gun from 'gun/gun'
import 'gun/sea'
import { PostIdentifier } from '../../database/type'
import { PublishedAESKey } from '../../crypto/crypto-alpha-40'
interface PersonOnGun {
    proofPostId: string
}
interface PostOnGun {
    /** NO identifier here! */
    keys: { encryptedKey: string; salt: string }[]
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
const gun = new Gun<ApplicationStateInGunVersion2>()
function isPersonOnGun(x: any): x is PersonOnGun {
    return typeof x.proofPostId === 'string'
}
function isPostOnGun(x: any): x is PostOnGun {
    return Array.isArray(x.keys)
}
async function postIdToKey(post: PostIdentifier) {
    const hash = await Gun.SEA.work(post, Version2Post, undefined, {
        name: 'SHA-256',
        encode: 'base64',
        // TODO: How many iterations is better?
        iterations: 5,
    })
    return hash!
}
export async function queryPostAESKeyV2(postIdentifier: PostIdentifier) {}

export async function publishPostAESKey(
    postIdentifier: string,
    receiversKeys: {
        key: PublishedAESKey
        name: string
    }[],
) {
    throw new Error('Not implemented')
}
