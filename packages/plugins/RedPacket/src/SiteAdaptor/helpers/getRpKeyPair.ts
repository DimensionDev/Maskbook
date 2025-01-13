import { web3 } from '@coral-xyz/anchor'
import { parseJSON } from '@masknet/web3-providers/helpers'

export function getRpKeyPair(accountId: web3.PublicKey) {
    // eslint-disable-next-line no-restricted-globals
    const item = localStorage.getItem(`rpKeyPair-${accountId.toBase58()}`)
    if (!item) return null

    const parsed = parseJSON<{
        publicKey: string // base58
        secretKey: string // hex
    }>(item)
    if (!parsed) return null

    return web3.Keypair.fromSecretKey(Uint8Array.from(Buffer.from(parsed.secretKey, 'hex')))
}

export function setRpKeyPair(accountId: web3.PublicKey, keyPair: web3.Keypair) {
    // eslint-disable-next-line no-restricted-globals
    localStorage.setItem(
        `rpKeyPair-${accountId.toBase58()}`,
        JSON.stringify({
            publicKey: keyPair.publicKey.toBase58(),
            secretKey: Buffer.from(keyPair.secretKey).toString('hex'),
        }),
    )
}
