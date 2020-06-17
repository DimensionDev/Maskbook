import { web3 } from './web3'
import type { TransactionObject, Tx } from './contracts/types'
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
    if (!tx.from) throw new Error('cannot find address')
    return Promise.all([txObject.estimateGas(tx), web3.eth.getGasPrice(), Services.Nonce.getNonce(tx.from)])
        .then(([gas, gasPrice, nonce]) =>
            txObject
                .send({
                    ...tx,
                    gas,
                    gasPrice,
                    nonce,
                })
                .on('transactionHash', (hash: string) => {
                    Services.Nonce.commitNonce(web3.utils.toHex(tx.from!))
                    listeners?.onTransactionHash?.(hash)
                })
                .on('receipt', (receipt: TransactionReceipt) => listeners?.onReceipt?.(receipt))
                .on('confirmation', (no: number, receipt: TransactionReceipt) =>
                    listeners?.onConfirmation?.(no, receipt),
                )
                .on('error', (err: Error) => listeners?.onTransactionError?.(err)),
        )
        .catch((err: Error) => listeners?.onEstimateError?.(err))
}

export async function sendTxConfigForTxHash(config: TransactionConfig) {
    if (!config.from) throw new Error('cannot find address')
    return new Promise<string>(async (resolve, reject) =>
        web3.eth.sendTransaction(
            {
                ...config,
                nonce: await Services.Nonce.getNonce(web3.utils.toHex(config.from!)),
            },
            (err, hash) => {
                if (err) reject(err)
                else {
                    Services.Nonce.commitNonce(web3.utils.toHex(config.from!))
                    resolve(hash)
                }
            },
        ),
    )
}
