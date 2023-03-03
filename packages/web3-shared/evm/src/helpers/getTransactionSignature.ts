import { sha3, toHex } from 'web3-utils'
import type { Transaction, ChainId } from '../types/index.js'

export function getTransactionSignature(chainId?: ChainId, transaction?: Partial<Transaction>) {
    if (!chainId || !transaction) return
    const { from, to, data, value } = transaction
    return sha3([chainId, from, to, data || '0x0', toHex((value as string) || '0x0') || '0x0'].join('_')) ?? undefined
}
