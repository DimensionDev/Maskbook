import { OnlyRunInContext } from '@holoflows/kit/es'
import { gun2, PostOnGun2, SharedAESKeyGun2 } from '.'
import { hashPostSalt, hashCryptoKey } from './hash'
import { PublishedAESKeyRecordV39 } from '../../../crypto/crypto-alpha-39'

OnlyRunInContext('background', 'gun')

/**
 * Query all possible keys stored on the gun
 * @param version current payload version
 * @param postSalt Post iv
 * @param partitionByCryptoKey Public key of the current user (receiver)
 */
export async function queryPostKeysOnGun2(
    version: -39,
    postSalt: string,
    partitionByCryptoKey: CryptoKey,
): Promise<{ keys: SharedAESKeyGun2[]; postHash: string; keyHash: string }> {
    const postHash = await hashPostSalt(postSalt)
    // In version > -39, we will use stable hash to prevent unstable result for key hashing
    const keyHash = await hashCryptoKey(partitionByCryptoKey, version > -39)

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
    return { keys: result, keyHash, postHash }
}

/**
 * Listen on the changes of all possible keys on the gun
 * @param version current payload version
 * @param postSalt Post iv
 * @param partitionByCryptoKey Public key of the current user (receiver)
 * @param callback
 */
export function subscribePostKeysOnGun2(
    version: -39,
    postSalt: string,
    partitionByCryptoKey: CryptoKey,
    callback: (data: SharedAESKeyGun2) => void,
) {
    hashPostSalt(postSalt).then(postHash => {
        // In version > -39, we will use stable hash to prevent unstable result for key hashing
        hashCryptoKey(partitionByCryptoKey, version > -39).then(keyHash => {
            gun2.get(postHash)
                // @ts-ignore
                .get(keyHash)
                .map()
                .on((data: SharedAESKeyGun2) => {
                    // @ts-ignore
                    const { _, ...data2 } = Object.assign({}, data)
                    callback(data2)
                })
        })
    })
    return () => (callback = () => {})
}

/**
 * Publish post keys on the gun
 * @param version current payload
 * @param postSalt Post iv
 * @param receiversKeys Keys needs to publish
 */
export async function publishPostAESKeyOnGun2(
    version: -39,
    postSalt: string,
    receiversKeys: PublishedAESKeyRecordV39[],
) {
    const postHash = await hashPostSalt(postSalt)
    // Store AES key to gun
    receiversKeys.forEach(async ({ aesKey, receiverKey }) => {
        const keyHash = await hashCryptoKey(receiverKey, version > -39)
        console.log(`gun[${postHash}][${keyHash}].push(`, aesKey, `)`)
        gun2.get(postHash)
            // @ts-ignore
            .get(keyHash)
            .set(aesKey)
    })
}
