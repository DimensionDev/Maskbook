import { compressSecp256k1Point, decompressSecp256k1Key, PersonaIdentifier, toHex } from '@masknet/shared-base'

export function convertPersonaHexPublicKey(persona: PersonaIdentifier) {
    const key256 = decompressSecp256k1Key(persona.compressedPoint.replace(/\|/g, '/'))
    if (!key256.x || !key256.y) return
    const arr = compressSecp256k1Point(key256.x, key256.y)

    return `0x${toHex(arr)}`
}
