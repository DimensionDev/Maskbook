import { Accounts } from 'web3-eth-accounts'

export function createAccount() {
    const accounts = new Accounts()
    return accounts.create()
}
