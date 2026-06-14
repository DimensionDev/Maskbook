import { signTransaction as viem_signTransaction } from 'viem/accounts'
import type { Hex, TransactionSerializable } from 'viem'

export function signTransaction(transaction: TransactionSerializable, privateKey: Hex, chainId?: number) {
    if (chainId !== undefined && transaction.chainId !== chainId)
        throw new Error('Transaction chain id does not match current chain id.')
    return viem_signTransaction({ privateKey, transaction })
}
