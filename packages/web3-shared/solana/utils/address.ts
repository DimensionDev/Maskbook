import bs58 from 'bs58'
import { Buffer } from 'buffer'
import Web3, { PublicKey } from '@solana/web3.js'

export function encodePublicKey(key: PublicKey) {
    return key.toBase58()
}

export function deocdeAddress(initData: string | Buffer) {
    const data = typeof initData === 'string' ? bs58.decode(initData) : initData
    if (!PublicKey.isOnCurve(data)) throw new Error(`Failed to create public key from ${bs58.encode(data)}.`)
    return new PublicKey(data)
}

export function formatAddress(address: string, size = 0) {
    if (!isValidAddress(address)) return address
    const address_ = bs58.encode(Buffer.from(address, 'hex'))
    if (size === 0 || size > 21) return address_
    return `${address_.substring(0, size)}...${address_.substring(-size)}`
}

export function isValidAddress(address?: string) {
    return !!(address && Web3.PublicKey.isOnCurve(bs58.decode(address)))
}
