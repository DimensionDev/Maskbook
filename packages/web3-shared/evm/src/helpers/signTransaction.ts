import * as Web3Accounts from /* webpackDefer: true */ 'web3-eth-accounts'
import type { Accounts } from 'web3-eth-accounts'
import type { Transaction } from '../types/index.js'

export function signTransaction(transaction: Transaction, privateKey: string) {
    if (typeof transaction.nonce === 'undefined') throw new Error('Nonce is required.')
    const Accounts_ = Web3Accounts.default as unknown as typeof Accounts
    const accounts = new Accounts_()
    return accounts.signTransaction(transaction, privateKey)
}
