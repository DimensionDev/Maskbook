import { IdentifierMap, ProfileIdentifier } from '@masknet/shared-base'
import { AESAlgorithmEnum } from '../payload'
import { encryptWithAES } from '../utils'
import {
    type EncryptTargetE2E,
    type EncryptIO,
    type EncryptResult,
    EncryptError,
    EncryptErrorReasons,
    type EncryptionResultE2E,
    EncryptionResultE2EMap,
} from './EncryptionTypes'
import { createEphemeralKeysMap, fillIV } from './utils'

/** @internal */
export async function v37_addReceiver(
    firstTime: boolean,
    context: {
        postIV: Uint8Array
        postKeyEncoded: Promise<Uint8Array>
        getEphemeralKey: ReturnType<typeof createEphemeralKeysMap>['getEphemeralKey']
    },
    target: EncryptTargetE2E,
    io: Pick<EncryptIO, 'getRandomECKey' | 'queryPublicKey' | 'getRandomValues'>,
): Promise<EncryptionResultE2EMap> {
    const { getEphemeralKey, postIV, postKeyEncoded } = context

    const ecdh = Promise.allSettled(
        target.target.map(async (id): Promise<EncryptionResultE2E> => {
            const iv = postIV || fillIV(io)
            const receiverPublicKey = id.isUnknown ? undefined : await io.queryPublicKey(id)
            if (!receiverPublicKey) throw new EncryptError(EncryptErrorReasons.PublicKeyNotFound)
            const [ephemeralPublicKey, ephemeralPrivateKey] = await getEphemeralKey(receiverPublicKey.algr)
            const aes = await crypto.subtle.deriveKey(
                { name: 'ECDH', public: receiverPublicKey.key },
                ephemeralPrivateKey,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt'],
            )
            // Note: we're reusing iv in the post encryption.
            const encryptedPostKey = await encryptWithAES(AESAlgorithmEnum.A256GCM, aes, iv, await postKeyEncoded)
            const result: EncryptionResultE2E = {
                encryptedPostKey: encryptedPostKey.unwrap(),
                target: id,
            }
            if (!firstTime) result.ephemeralPublicKey = ephemeralPublicKey
            return result
        }),
    ).then((x) => x.entries())

    const ecdhResult: EncryptResult['e2e'] = new IdentifierMap(new Map(), ProfileIdentifier)
    for (const [index, result] of await ecdh) {
        ecdhResult.set(target.target[index], result)
    }
    return ecdhResult
}
