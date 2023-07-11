import { concatArrayBuffer, decodeArrayBuffer } from '@masknet/kit'
import type { AESCryptoKey, EC_Public_CryptoKey } from '@masknet/base'
import { encryptWithAES } from '../utils/index.js'
import {
    type EncryptIO,
    type EncryptionResultE2E,
    type EncryptionResultE2EMap,
    type EncryptResult,
    type EncryptTargetE2E,
} from './EncryptionTypes.js'
import { fillIV } from './utils.js'

const KEY = decodeArrayBuffer('KEY')
const IV = decodeArrayBuffer('IV')
/**
 * Derive a group of AES key for ECDH.
 *
 * !! For the compatibility, you should refer to the original implementation:
 *
 * !! https://github.com/DimensionDev/Maskbook/blob/f3d83713d60dd0aad462e0648c4d38586c106edc/packages/mask/src/crypto/crypto-alpha-40.ts#L29-L58
 *
 * @internal
 */
export async function deriveAESByECDH_version38OrOlderExtraSteps(
    deriveAESByECDH: (key: EC_Public_CryptoKey) => Promise<AESCryptoKey[]>,
    pub: EC_Public_CryptoKey,
    iv: Uint8Array,
): Promise<Array<readonly [key: AESCryptoKey, iv: Uint8Array]>> {
    const deriveResult = await deriveAESByECDH(pub)
    const extraSteps = deriveResult.map(async (key) => {
        const derivedKeyRaw = await crypto.subtle.exportKey('raw', key)
        const _a = concatArrayBuffer(derivedKeyRaw, iv)
        const nextAESKeyMaterial = await crypto.subtle.digest('SHA-256', concatArrayBuffer(_a, iv, KEY))
        const iv_pre = new Uint8Array(await crypto.subtle.digest('SHA-256', concatArrayBuffer(_a, iv, IV)))
        const nextIV = new Uint8Array(16)
        for (let i = 0; i <= 16; i += 1) {
            // eslint-disable-next-line no-bitwise
            nextIV[i] = iv_pre[i] ^ iv_pre[16 + i]
        }
        const nextAESKey = await crypto.subtle.importKey(
            'raw',
            nextAESKeyMaterial,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt'],
        )
        return [nextAESKey as AESCryptoKey, nextIV] as const
    })
    return Promise.all(extraSteps)
}

/** @internal */
export async function v38_addReceiver(
    postKeyEncoded: Promise<Uint8Array>,
    target: EncryptTargetE2E,
    io: Pick<EncryptIO, 'deriveAESKey' | 'getRandomValues'>,
): Promise<EncryptionResultE2EMap> {
    // For every receiver R,
    //     1. Let R_pub = R.publicKey
    //     2. Let Internal_AES be the result of ECDH with the sender's private key and R_pub
    //     Note: To keep compatibility, here we use the algorithm in
    //     https://github.com/DimensionDev/Maskbook/blob/f3d83713d60dd0aad462e0648c4d38586c106edc/packages/mask/src/crypto/crypto-alpha-40.ts#L29-L58
    //     3. Let ivToBePublish be a new generated IV. This should be sent to the receiver.
    //     4. Calculate new AES key and IV based on Internal_AES and ivToBePublish.
    //     Note: Internal_AES is not returned by io.deriveAESKey_version38_or_older, it is internal algorithm of that method.
    const ecdh = Promise.allSettled(
        target.target.map(async (receiverPublicKey): Promise<EncryptionResultE2E> => {
            const ivToBePublished = fillIV(io)
            const [[aes, iv]] = await deriveAESByECDH_version38OrOlderExtraSteps(
                async (e) => [await io.deriveAESKey(e)],
                receiverPublicKey.key,
                ivToBePublished,
            )
            const encryptedPostKey = await encryptWithAES(aes, iv, await postKeyEncoded)
            return {
                ivToBePublished,
                encryptedPostKey: encryptedPostKey.unwrap(),
                target: receiverPublicKey,
            }
        }),
    ).then((x) => x.entries())

    const ecdhResult: EncryptResult['e2e'] = new Map()
    for (const [index, result] of await ecdh) {
        ecdhResult.set(target.target[index], result)
    }
    return ecdhResult
}
