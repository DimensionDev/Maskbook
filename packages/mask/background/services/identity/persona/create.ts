import { decodeArrayBuffer } from '@dimensiondev/kit'
import { EC_Public_JsonWebKey, PersonaIdentifier, isEC_Private_JsonWebKey } from '@masknet/shared-base'
import { createPersonaByJsonWebKey } from '../../../database/persona/helper'
import { decode } from '@msgpack/msgpack'
import { omit } from 'lodash-unified'

export async function createPersonaByPrivateKey(
    privateKeyString: string,
    nickname: string,
): Promise<PersonaIdentifier> {
    const privateKey = decode(decodeArrayBuffer(privateKeyString))
    if (!isEC_Private_JsonWebKey(privateKey)) throw new TypeError('Invalid private key')

    return createPersonaByJsonWebKey({ privateKey, publicKey: omit(privateKey, 'd') as EC_Public_JsonWebKey, nickname })
}
