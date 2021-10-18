import type { EthereumTransactionConfig } from '..'

export function isEIP1559Transaction(receipt: EthereumTransactionConfig) {
    return typeof receipt.maxFeePerGas !== 'undefined' && typeof receipt.maxPriorityFeePerGas !== 'undefined'
}
