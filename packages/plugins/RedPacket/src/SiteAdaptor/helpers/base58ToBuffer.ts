import { web3 } from '@coral-xyz/anchor'

export function base58ToBuffer(base58: string) {
    const pubkey = new web3.PublicKey(base58)
    return pubkey.toBuffer()
}
