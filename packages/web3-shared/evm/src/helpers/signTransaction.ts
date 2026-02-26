import { signTransaction as viem_signTransaction } from 'viem/accounts'
import type { Hex, TransactionSerializable } from 'viem'

export function signTransaction(transaction: TransactionSerializable, privateKey: Hex) {
    return viem_signTransaction({ privateKey, transaction })
}
