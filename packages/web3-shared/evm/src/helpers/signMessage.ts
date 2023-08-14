import Accounts from 'web3-eth-accounts'

export function signMessage(message: string, privateKey: string) {
    const accounts = new (Accounts as unknown as new () => Accounts.Accounts)()
    return accounts.sign(message, privateKey)
}
