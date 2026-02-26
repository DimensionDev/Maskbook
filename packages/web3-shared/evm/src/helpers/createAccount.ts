import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'

export function createAccount() {
    const privateKey = generatePrivateKey()
    const address = privateKeyToAddress(privateKey)
    return { privateKey, address }
}
