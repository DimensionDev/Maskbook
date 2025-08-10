import defer * as Web3Accounts from 'web3-eth-accounts'
import type { Accounts } from 'web3-eth-accounts'

export function signMessage(message: string, privateKey: string): Web3Accounts.Sign {
    const Accounts_ = Web3Accounts.default as unknown as typeof Accounts
    const accounts = new Accounts_()
    return accounts.sign(message, privateKey)
}
