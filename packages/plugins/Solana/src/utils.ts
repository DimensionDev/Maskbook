import { Buffer } from 'buffer'
import bs58 from 'bs58'

export function hexToBase58(hex: string) {
    const buffer = Buffer.from(hex, 'hex')
    return bs58.encode(buffer)
}
