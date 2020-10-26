import { useCallback } from 'react'
import type { TransactionReceipt, TransactionConfig } from 'web3-core'
import stringify from 'json-stable-stringify'
import type { TransactionObject } from '../../contracts/types'
import { nonFunctionalWeb3 } from '../web3'
import Services from '../../extension/service'
import { TransactionEventType } from '../types'

interface TxListeners {
    onTransactionHash?: (hash: string) => void
    onTransactionError?: (error: Error) => void
    onReceipt?: (receipt: TransactionReceipt) => void
    onConfirmation?: (no: number, receipt: TransactionReceipt) => void
    onEstimateError?: (error: Error) => void
}

/**
 * Create a callback which will invoke .call() on given transaction
 * @param tx
 */
export function useCallCallback<R, T extends TransactionObject<R>>(tx: T) {
    return useCallback(() => tx.call(), [tx.encodeABI()])
}

/**
 * Create a callback which will invoke .send() on given transaction
 * @param address the address of signer
 * @param config
 */
export function useSendCallback<R, T extends TransactionObject<R>>(address: string, tx: T, config: TransactionConfig) {
    return useSendTransactionCallback(address, {
        ...config,
        data: tx.encodeABI(),
    })
}

/**
 * Create a callback which will invoke .sendTransaction() on given transaction
 * @param address the address of signer
 * @param config
 */
export function useSendTransactionCallback(address: string, config: TransactionConfig) {
    return useCallback(
        async (listeners?: TxListeners) => {
            nonFunctionalWeb3.eth
                .sendTransaction({
                    ...config,
                    nonce: await Services.Ethereum.getNonce(address),
                })
                .on(TransactionEventType.TRANSACTION_HASH, (hash: string) => {
                    Services.Ethereum.commitNonce(address)
                    listeners?.onTransactionHash?.(hash)
                })
                .on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => listeners?.onReceipt?.(receipt))
                .on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) =>
                    listeners?.onConfirmation?.(no, receipt),
                )
                .on(TransactionEventType.ERROR, (err: Error) => {
                    if (err.message.includes('nonce too low')) Services.Ethereum.resetNonce(address)
                    listeners?.onTransactionError?.(err)
                })
        },
        [stringify(config)],
    )
}
