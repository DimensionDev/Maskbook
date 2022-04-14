import { decodeArrayBuffer } from '@dimensiondev/kit'
import type { ECKeyIdentifier, EC_Private_JsonWebKey, EC_Public_JsonWebKey } from '@masknet/shared-base'
import { createPersonaByJsonWebKey } from '../../../database/persona/helper'
import { decode } from '@msgpack/msgpack'
import { isObjectLike, omit } from 'lodash-unified'

export async function createPersonaByPrivateKey(privateKeyString: string, nickname: string): Promise<ECKeyIdentifier> {
    const privateKey = decode(decodeArrayBuffer(privateKeyString))
    if (!isValid(privateKey)) throw new TypeError('Invalid private key')

    return createPersonaByJsonWebKey({ privateKey, publicKey: omit(privateKey, 'd') as EC_Public_JsonWebKey, nickname })

    // check if item is a valid JsonWebKey object
    function isValid(item: any): item is EC_Private_JsonWebKey {
        if (!isObjectLike(item)) return false
        if (!item.d) return false // d is private key
        if (!item.x || !item.y || !item.crv) return false
        return true
    }
}
