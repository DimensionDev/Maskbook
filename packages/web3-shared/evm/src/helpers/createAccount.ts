import Web3Accounts, { type Accounts } from 'web3-eth-accounts'

export function createAccount() {
    const Accounts_ = Web3Accounts as unknown as typeof Accounts
    const accounts = new Accounts_()
    return accounts.create()
}
