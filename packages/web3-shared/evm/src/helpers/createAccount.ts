import type { Account } from 'web3-core'
import defer * as Web3Accounts from 'web3-eth-accounts'
import type { Accounts } from 'web3-eth-accounts'

export function createAccount(): Account {
    const Accounts_ = Web3Accounts.default as unknown as typeof Accounts
    const accounts = new Accounts_()
    return accounts.create()
}
