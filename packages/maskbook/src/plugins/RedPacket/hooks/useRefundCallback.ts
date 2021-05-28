import { useCallback } from 'react'
import type { NonPayableTx } from '@dimensiondev/contracts/types/types'
import { useRedPacketContract } from '../contracts/useRedPacketContract'
import {
    TransactionEventType,
    TransactionStateType,
    useGasPrice,
    useNonce,
    useTransactionState,
} from '@dimensiondev/web3-shared'

export function useRefundCallback(from: string, id?: string) {
    const nonce = useNonce()
    const gasPrice = useGasPrice()
    const [refundState, setRefundState] = useTransactionState()
    const redPacketContract = useRedPacketContract()

    const refundCallback = useCallback(async () => {
        if (!redPacketContract || !id) {
            setRefundState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // start waiting for provider to confirm tx
        setRefundState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // estimate gas and compose transaction
        const config = {
            from,
            gas: await redPacketContract.methods
                .refund(id)
                .estimateGas()
                .catch((error) => {
                    setRefundState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    throw error
                }),
            gasPrice,
            nonce,
        }

        // send transaction and wait for hash
        return new Promise<string>((resolve, reject) => {
            redPacketContract.methods
                .refund(id)
                .send(config as NonPayableTx)
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setRefundState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setRefundState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [nonce, gasPrice, id, redPacketContract])

    const resetCallback = useCallback(() => {
        setRefundState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [refundState, refundCallback, resetCallback] as const
}
