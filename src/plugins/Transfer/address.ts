import { EthereumAddress } from 'wallet.ts'
import { ec as EC } from 'elliptic'
import { ECKeyIdentifier } from '../../database/type'
import { decompressSecp256k1Key, compressSecp256k1Point } from '../../utils/type-transform/SECP256k1-Compression'

export async function ethAddrFrom(identifier: string) {
    const ec_identifier = ECKeyIdentifier.fromString(identifier).unwrap() as ECKeyIdentifier
    const { x, y } = decompressSecp256k1Key(ec_identifier.compressedPoint, 'public') ?? {}
    if (!x || !y) return
    const ec = new EC('secp256k1')
    const key = ec.keyFromPublic(compressSecp256k1Point(x, y), 'array')
    return EthereumAddress.from((key.getPublic().encode('array', false) as any) as Buffer).address
}

export async function parseEthAddr(content: string): Promise<string> {
    if (EthereumAddress.isValid(content)) return content
    if (content.startsWith('ethereum:')) return parseEthAddr(content.replace(/^ethereum:/, ''))
    if (!content.startsWith('0x')) return parseEthAddr(`0x${content}`)
    return ''
}
