import { useCallback } from 'react'
import type { TransactionReceipt } from 'web3-core'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { TransactionEventType, TransactionStateType, useAccount, useTransactionState } from '@masknet/web3-shared-evm'
import { useITO_Contract } from './useITO_Contract'

export function useDestructCallback(ito_address: string) {
    const account = useAccount()
    const { contract: ITO_Contract } = useITO_Contract(ito_address)
    const [destructState, setDestructState] = useTransactionState()

    const destructCallback = useCallback(
        async (id: string) => {
            if (!ITO_Contract || !id) {
                setDestructState({
                    type: TransactionStateType.UNKNOWN,
                })
                return
            }

            // start waiting for provider to confirm tx
            setDestructState({
                type: TransactionStateType.WAIT_FOR_CONFIRMING,
            })

            // estimate gas and compose transaction
            const config = {
                from: account,
                gas: await ITO_Contract.methods
                    .destruct(id)
                    .estimateGas({
                        from: account,
                    })
                    .catch((error: Error) => {
                        setDestructState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        throw error
                    }),
            }

            // send transaction and wait for hash
            return new Promise<string>((resolve, reject) => {
                ITO_Contract.methods
                    .destruct(id)
                    .send(config as NonPayableTx)
                    .on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => {
                        setDestructState({
                            type: TransactionStateType.CONFIRMED,
                            no: 0,
                            receipt,
                        })
                        resolve(receipt.transactionHash)
                    })
                    .on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                        setDestructState({
                            type: TransactionStateType.CONFIRMED,
                            no,
                            receipt,
                        })
                        resolve(receipt.transactionHash)
                    })
                    .on(TransactionEventType.ERROR, (error: Error) => {
                        setDestructState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        reject(error)
                    })
            })
        },
        [ITO_Contract],
    )

    const resetCallback = useCallback(() => {
        setDestructState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [destructState, destructCallback, resetCallback] as const
}
