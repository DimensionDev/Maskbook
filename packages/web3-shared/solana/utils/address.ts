import bs58 from 'bs58'
import * as Web3 from '@solana/web3.js'

export function encodePublicKey(key: Web3.PublicKey) {
    return key.toBase58()
}

export function deocdeAddress(initData: string | Buffer) {
    const data = typeof initData === 'string' ? bs58.decode(initData) : initData
    if (!Web3.PublicKey.isOnCurve(data)) throw new Error(`Failed to create public key from ${bs58.encode(data)}.`)
    return new Web3.PublicKey(data)
}

export function formatAddress(address: string, size = 0) {
    if (size === 0 || size >= 22) return address
    return `${address.substr(0, size)}...${address.substr(-size)}`
}
export function isValidAddress(address?: string) {
    return !!(address && Web3.PublicKey.isOnCurve(bs58.decode(address)))
}
