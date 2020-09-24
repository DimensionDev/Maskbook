import type { TransactionObject, Tx } from '../../contracts/types'
import type { TransactionReceipt, TransactionConfig } from 'web3-core'
import { sendTransaction, estimateGas, getNonce } from '../../extension/background-script/EthereumService'
import { StageType } from '../../utils/promiEvent'

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

    const tx_ = tx as TransactionConfig
    const [gas, nonce] = await Promise.all([
        estimateGas({
            ...tx_,
            data: txObject.encodeABI(),
        }),
        getNonce(address),
    ])
    const iterator = sendTransaction(address, {
        ...tx_,
        gas,
        nonce,
        data: txObject.encodeABI(),
    })

    try {
        for await (const stage of iterator) {
            switch (stage.type) {
                case StageType.TRANSACTION_HASH:
                    listeners.onTransactionHash?.(stage.hash)
                    break
                case StageType.RECEIPT:
                    listeners.onReceipt?.(stage.receipt)
                    break
                case StageType.CONFIRMATION:
                    listeners.onConfirmation?.(stage.no, stage.receipt)
                    break
            }
        }
    } catch (err) {
        listeners.onTransactionError?.(err)
    }
}
