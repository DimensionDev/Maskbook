import * as Web3Accounts from /* webpackDefer: true */ 'web3-eth-accounts'
import type { Transaction } from '../types/index.js'

export function signTransaction(transaction: Transaction, privateKey: string) {
    if (typeof transaction.nonce === 'undefined') throw new Error('Nonce is required.')
    return Web3Accounts.signTransaction(new Web3Accounts.Transaction(transaction), privateKey)
}
