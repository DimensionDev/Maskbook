import Accounts from 'web3-eth-accounts'

export function createAccount() {
    const accounts = new (Accounts as unknown as new () => Accounts.Accounts)()
    return accounts.create()
}
