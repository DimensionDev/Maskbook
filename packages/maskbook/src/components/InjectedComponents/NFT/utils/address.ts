import { ECKeyIdentifier } from '@masknet/shared-base'
import { EthereumAddress } from 'wallet.ts'
import { compressSecp256k1Point, decompressSecp256k1Key } from '../../../../utils'
import { ec as EC } from 'elliptic'

export async function ethAddrFrom(identifier: string) {
    const ec_identifier = ECKeyIdentifier.fromString(identifier).unwrap() as ECKeyIdentifier
    const { x, y } = decompressSecp256k1Key(ec_identifier.compressedPoint, 'public') ?? {}
    if (!x || !y) return
    const ec = new EC('secp256k1')
    const key = ec.keyFromPublic(compressSecp256k1Point(x, y), 'array')
    return EthereumAddress.from(key.getPublic().encode('array', false) as any as Buffer).address
}
