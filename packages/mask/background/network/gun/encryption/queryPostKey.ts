import { decodeArrayBuffer, encodeArrayBuffer } from '@dimensiondev/kit'
import type { DecryptStaticECDH_PostKey } from '@masknet/encryption'
import type { ProfileIdentifier } from '@masknet/shared-base'
import type { default as gun } from 'gun'
import { getGunData } from '../utils'
type Gun = ReturnType<typeof gun>

// !!! Change how this function access Gun will break the compatibility of v40 payload decryption.
export async function GUN_queryPostKey_version40(
    gun: Gun,
    iv: Uint8Array,
    whoAmI: ProfileIdentifier,
): Promise<null | DecryptStaticECDH_PostKey> {
    // PATH ON GUN: maskbook > posts > iv > userID
    const result = await getGunData(gun, 'maskbook', 'posts', encodeArrayBuffer(iv), whoAmI.userId)
    if (!isValidData(result)) return null
    return {
        encryptedPostKey: new Uint8Array(decodeArrayBuffer(result.encryptedKey)),
        postKeyIV: new Uint8Array(decodeArrayBuffer(result.salt)),
    }

    type DataOnGun = { encryptedKey: string; salt: string }
    function isValidData(x: typeof result): x is DataOnGun {
        if (!x) return false

        const { encryptedKey, salt: encryptedKeyIV } = x
        if (typeof encryptedKey !== 'string' || typeof encryptedKeyIV !== 'string') return false
        return true
    }
}
