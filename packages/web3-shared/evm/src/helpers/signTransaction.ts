import Accounts from 'web3-eth-accounts'
import type { Transaction } from '../types/index.js'

export function signTransaction(transaction: Transaction, privateKey: string) {
    if (typeof transaction.nonce === 'undefined') throw new Error('Nonce is required.')
    const accounts = new (Accounts as unknown as new () => Accounts.Accounts)()
    return accounts.signTransaction(transaction, privateKey)
}
