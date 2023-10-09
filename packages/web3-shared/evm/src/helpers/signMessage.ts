import Web3Accounts, { type Accounts } from 'web3-eth-accounts'

export function signMessage(message: string, privateKey: string) {
    const Accounts_ = Web3Accounts as unknown as typeof Accounts
    const accounts = new Accounts_()
    return accounts.sign(message, privateKey)
}
