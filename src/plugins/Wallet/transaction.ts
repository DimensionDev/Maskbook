import { web3 } from './web3'
import type { TransactionObject, Tx } from '../../contracts/types'
import type { TransactionConfig, TransactionReceipt } from 'web3-core'
import Services from '../../extension/service'

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
    return Promise.all([txObject.estimateGas(tx), web3.eth.getGasPrice(), Services.Ethereum.getNonce(address)])
        .then(([gas, gasPrice, nonce]) => {
            const sent = txObject.send({
                ...tx,
                gas,
                gasPrice,
                nonce,
            })
            sent.catch((err: Error) => listeners.onTransactionError?.(err))
            sent.on('transactionHash', (hash: string) => {
                Services.Ethereum.commitNonce(address)
                listeners.onTransactionHash?.(hash)
            })
                .on('receipt', (receipt: TransactionReceipt) => listeners.onReceipt?.(receipt))
                .on('confirmation', (no: number, receipt: TransactionReceipt) =>
                    listeners.onConfirmation?.(no, receipt),
                )
                .on('error', (err: Error) => {
                    if (err.message.includes('nonce too low')) Services.Ethereum.resetNonce(address)
                    listeners.onTransactionError?.(err)
                })
        })
        .catch((err: Error) => listeners.onEstimateError?.(err))
}

export async function sendTxConfigForTxHash(config: TransactionConfig & { from?: string }) {
    const address = config.from
    if (!address) throw new Error('cannot find address')
    return new Promise<string>(async (resolve, reject) =>
        web3.eth.sendTransaction(
            {
                ...config,
                nonce: await Services.Ethereum.getNonce(address),
            },
            (err, hash) => {
                if (err) {
                    if (err.message.includes('nonce too low')) Services.Ethereum.resetNonce(address)
                    reject(err)
                } else {
                    Services.Ethereum.commitNonce(address)
                    resolve(hash)
                }
            },
        ),
    )
}
