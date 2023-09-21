import { Accounts } from 'web3-eth-accounts'

export function signMessage(message: string, privateKey: string) {
    const accounts = new Accounts()
    return accounts.sign(message, privateKey)
}
