import { concatArrayBuffer, decodeArrayBuffer } from '@dimensiondev/kit'
import type { AESCryptoKey, EC_Public_CryptoKey } from '@masknet/shared-base'

const KEY = decodeArrayBuffer('KEY')
const IV = decodeArrayBuffer('IV')
/**
 * Derive a group of AES key for ECDH.
 *
 * !! For the compatibility, you should refer to the original implementation:
 *
 * !! https://github.com/DimensionDev/Maskbook/blob/f3d83713d60dd0aad462e0648c4d38586c106edc/packages/mask/src/crypto/crypto-alpha-40.ts#L29-L58
 *
 * Error from this function will become a fatal error.
 */
export async function deriveAESByECDH_version38OrOlderExtraSteps(
    deriveAESByECDH: (key: EC_Public_CryptoKey) => Promise<AESCryptoKey[]>,
    pub: EC_Public_CryptoKey,
    iv: Uint8Array,
): Promise<(readonly [key: AESCryptoKey, iv: Uint8Array])[]> {
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
