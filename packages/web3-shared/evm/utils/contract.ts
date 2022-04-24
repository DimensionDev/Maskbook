import type { BaseContract, PayableTransactionObject } from '@masknet/web3-contracts/types/types'
import type { SendOptions } from 'web3-eth-contract'
import type { EthereumTransactionConfig } from '../types'

export async function encodeTransaction(
    contract: BaseContract,
    transaction: PayableTransactionObject<unknown>,
    options?: SendOptions & {
        maxPriorityFeePerGas?: string
        maxFeePerGas?: string
    },
) {
    const encoded: EthereumTransactionConfig = {
        from: contract.defaultAccount ?? undefined,
        to: contract.options.address,
        data: transaction.encodeABI(),
        ...options,
    }

    if (encoded.gas) {
        encoded.gas = await transaction.estimateGas(options)
    }

    return encoded
}
