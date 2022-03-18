import { unreachable } from '@dimensiondev/kit'
import type { ProfileIdentifier, AESCryptoKey } from '@masknet/shared-base'
import { encodePostKey } from './Encryption'
import type { EncryptIO, EncryptionResultE2EMap, EncryptTargetE2E } from './EncryptionTypes'
import { createEphemeralKeysMap } from './utils'
import { v37_addReceiver } from './v37-ecdh'
import { v38_addReceiver } from './v38-ecdh'

export interface AppendEncryptionOptions {
    version: -38 | -37
    postAESKey: AESCryptoKey
    iv: Uint8Array
    target: ProfileIdentifier[]
}
export interface AppendEncryptionIO
    extends Pick<EncryptIO, 'queryPublicKey' | 'getRandomECKey' | 'deriveAESKey' | 'getRandomValues'> {}
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
