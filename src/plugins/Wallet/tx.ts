import type { EventData } from 'web3-eth-contract'
import { web3 } from './web3'
import type { TransactionObject, Tx } from './contract/types'
import type { TransactionConfig, TransactionReceipt } from 'web3-core'

interface TxListeners {
    onTransactionHash?: (hash: string) => void
    onTransactionError?: (error: Error) => void
    onReceipt?: (receipt: TransactionReceipt) => void
    onConfirmation?: (no: number, receipt: TransactionReceipt) => void
    onEstimateError?: (error: Error) => void
}

export async function sendTx<R, T extends TransactionObject<R>>(txObject: T, tx: Tx = {}, listeners: TxListeners = {}) {
    return Promise.all([txObject.estimateGas(tx), web3.eth.getGasPrice()])
        .then(([gas, gasPrice]) =>
            txObject
                .send({
                    ...tx,
                    gas,
                    gasPrice,
                })
                .on('transactionHash', (hash: string) => listeners?.onTransactionHash?.(hash))
                .on('receipt', (receipt: TransactionReceipt) => listeners?.onReceipt?.(receipt))
                .on('confirmation', (no: number, receipt: TransactionReceipt) =>
                    listeners?.onConfirmation?.(no, receipt),
                )
                .on('error', (err: Error) => listeners?.onTransactionError?.(err)),
        )
        .catch((err: Error) => listeners?.onEstimateError?.(err))
}

export async function sendTxConfigForTxHash(config: TransactionConfig) {
    return new Promise<string>((resolve, reject) => {
        web3.eth
            .sendTransaction(config)
            .on('transactionHash', (hash: string) => resolve(hash))
            .on('error', (err: Error) => reject(err))
            .catch((err: Error) => reject(err))
    })
}
