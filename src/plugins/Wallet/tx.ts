import type { EventData } from 'web3-eth-contract'
import { web3 } from './web3'
import type { TransactionObject, Tx } from './contract/types'

interface TxReceipt {
    blockHash: string
    blockNumber: number
    transactionHash: string
    events: Record<string, EventData>
}

interface TxListeners {
    onTransactionHash?: (hash: string) => void
    onTransactionError?: (error: Error) => void
    onReceipt?: (receipt: TxReceipt) => void
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
                .on('receipt', (receipt: TxReceipt) => listeners?.onReceipt?.(receipt))
                .on('error', (err: Error) => listeners?.onTransactionError?.(err)),
        )
        .catch((err: Error) => listeners?.onEstimateError?.(err))
}
