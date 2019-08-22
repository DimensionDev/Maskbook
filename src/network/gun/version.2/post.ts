import { OnlyRunInContext } from '@holoflows/kit/es'
import { gun2, PostOnGun2, SharedAESKeyGun2 } from '.'
import { hashPostSalt, hashCryptoKey } from './hash'
import { PublishedAESKeyRecordV39 } from '../../../crypto/crypto-alpha-39'

OnlyRunInContext('background', 'gun')

/**
 * Query all possible keys stored on the gun
 * @param postSalt Post iv
 * @param partitionByCryptoKey Public key of the current user (receiver)
 */
export async function queryPostKeysOnGun2(
    postSalt: string,
    partitionByCryptoKey: CryptoKey,
): Promise<SharedAESKeyGun2[]> {
    const postHash = await hashPostSalt(postSalt)
    const keyHash = await hashCryptoKey(partitionByCryptoKey)

    // ? here we get the internal node names of gun2[postHash][keyHash]
    // ? where gun2[postHash][keyHash] is a list
    const internalNodes: Record<string, string> =
        (await gun2
            .get(postHash)
            // @ts-ignore
            .get(keyHash)
            .once().then!()) || {}
    // ? In this step we get something like ["jzarhbyjtexiE7aB1DvQ", "jzarhuse6xlTAtblKRx9"]
    const internalKeys = Object.keys(internalNodes).filter(x => x !== '_')
    // ? In this step we get all keys in this category (gun2[postHash][keyHash])
    const resultPromise = internalKeys.map(key => gun2.get(key).once().then!())
    const result = (await Promise.all(resultPromise)) as SharedAESKeyGun2[]
    console.info(`await gun2[${postHash}][${keyHash}]\n`, result)
    return result
}

/**
 * Listen on the changes of all possible keys on the gun
 * @param postSalt Post iv
 * @param partitionByCryptoKey Public key of the current user (receiver)
 * @param callback
 */
export function subscribePostKeysOnGun2(
    postSalt: string,
    partitionByCryptoKey: CryptoKey,
    callback: (data: PostOnGun2) => void,
) {
    hashPostSalt(postSalt).then(postHash => {
        hashCryptoKey(partitionByCryptoKey).then(keyHash => {
            gun2.get(postHash)
                // @ts-ignore
                .get(keyHash)
                .map()
                .on((data: PostOnGun2) => {
                    const { _, ...data2 } = Object.assign({}, data)
                    callback(data2)
                })
        })
    })
    // tslint:disable-next-line: no-parameter-reassignment
    return () => (callback = () => {})
}

/**
 * Publish post keys on the gun
 * @param postSalt Post iv
 * @param receiversKeys Keys needs to publish
 */
export async function publishPostAESKeyOnGun2(postSalt: string, receiversKeys: PublishedAESKeyRecordV39[]) {
    const postHash = await hashPostSalt(postSalt)
    // Store AES key to gun
    receiversKeys.forEach(async ({ aesKey, receiverKey }) => {
        const keyHash = await hashCryptoKey(receiverKey)
        gun2.get(postHash)
            // @ts-ignore
            .get(keyHash)
            .set(aesKey)
    })
}
