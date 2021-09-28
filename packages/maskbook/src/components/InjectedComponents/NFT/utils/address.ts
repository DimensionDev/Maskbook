import { ECKeyIdentifier } from '@masknet/shared-base'
import { EthereumAddress } from 'wallet.ts'
import { decompressSecp256k1Key } from '../../../../utils'
import { ec as EC } from 'elliptic'
import secp256k1 from 'tiny-secp256k1'
import { Convert, combine } from 'pvtsutils'

export async function ethAddrFrom(identifier: string) {
    const ec_identifier = ECKeyIdentifier.fromString(identifier).unwrap() as ECKeyIdentifier
    const { x, y } = decompressSecp256k1Key(ec_identifier.compressedPoint, 'public') ?? {}
    if (!x || !y) return
    const ec = new EC('secp256k1')
    const key = ec.keyFromPublic(compressSecp256k1Point(x, y), 'array')
    return EthereumAddress.from(key.getPublic().encode('array', false) as any as Buffer).address
}

/**
 * Compress x & y into a single x
 */
export function compressSecp256k1Point(x: string, y: string): Uint8Array {
    const xb = Convert.FromBase64Url(x)
    const yb = Convert.FromBase64Url(y)
    const point = Buffer.from(combine(new Uint8Array([0x04]), xb, yb))
    if (secp256k1.isPoint(point)) {
        return secp256k1.pointCompress(point, true)
    } else {
        throw new TypeError('Not a point on secp256k1!')
    }
}
