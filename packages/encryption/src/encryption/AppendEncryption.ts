import { unreachable } from '@masknet/kit'
import type { AESCryptoKey, EC_Public_CryptoKey } from '@masknet/base'
import { encodePostKey } from './Encryption.js'
import type { EncryptIO, EncryptionResultE2EMap, EncryptTargetE2E } from './EncryptionTypes.js'
import { createEphemeralKeysMap } from './utils.js'
import { v37_addReceiver } from './v37-ecdh.js'
import { v38_addReceiver } from './v38-ecdh.js'
import type { EC_Key } from '../index.js'

export interface AppendEncryptionOptions {
    version: -38 | -37
    postAESKey: AESCryptoKey
    iv: Uint8Array
    target: ReadonlyArray<EC_Key<EC_Public_CryptoKey>>
}
export interface AppendEncryptionIO extends Pick<EncryptIO, 'getRandomECKey' | 'deriveAESKey' | 'getRandomValues'> {}
export async function appendEncryptionTarget(
    options: AppendEncryptionOptions,
    io: AppendEncryptionIO,
): Promise<EncryptionResultE2EMap> {
    const target: EncryptTargetE2E = { type: 'E2E', target: options.target }
    const postKeyEncoded = encodePostKey(options.version, options.postAESKey)

    if (options.version === -38) {
        return v38_addReceiver(postKeyEncoded, target, io)
    } else if (options.version === -37) {
        const { getEphemeralKey } = createEphemeralKeysMap(io)
        return v37_addReceiver(false, { postKeyEncoded, postIV: options.iv, getEphemeralKey }, target, io)
    }
    unreachable(options.version)
}
