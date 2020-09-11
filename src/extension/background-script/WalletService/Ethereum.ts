import { web3 } from '../../../plugins/Wallet/web3'
import { getNonce, commitNonce, resetNonce } from '../NonceService'
import type { TransactionReceipt } from 'web3-core'
import type { TransactionObject, Tx } from '../../../contracts/types'

interface TxListeners {
    onTransactionHash?: (hash: string) => void
    onTransactionError?: (error: Error) => void
    onReceipt?: (receipt: TransactionReceipt) => void
    onConfirmation?: (no: number, receipt: TransactionReceipt) => void
    onEstimateError?: (error: Error) => void
}

export async function sendTx<R, T extends TransactionObject<R>>(txObject: T, tx: Tx = {}, listeners: TxListeners = {}) {
    const address = tx.from
    if (!address) throw new Error('cannot find address')
    return Promise.all([txObject.estimateGas(tx), web3.eth.getGasPrice(), getNonce(address)])
        .then(([gas, gasPrice, nonce]) => {
            const sent = txObject.send({
                ...tx,
                gas,
                gasPrice,
                nonce,
            })
            sent.catch((err: Error) => listeners.onTransactionError?.(err))
            sent.on('transactionHash', (hash: string) => {
                commitNonce(address)
                listeners.onTransactionHash?.(hash)
            })
                .on('receipt', (receipt: TransactionReceipt) => listeners.onReceipt?.(receipt))
                .on('confirmation', (no: number, receipt: TransactionReceipt) =>
                    listeners.onConfirmation?.(no, receipt),
                )
                .on('error', (err: Error) => {
                    if (err.message.includes('nonce too low')) resetNonce(address)
                    listeners.onTransactionError?.(err)
                })
        })
        .catch((err: Error) => listeners.onEstimateError?.(err))
}
