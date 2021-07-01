import { useCallback } from 'react'
import type { TransactionReceipt } from 'web3-core'
import type { NonPayableTx } from '@masknet/contracts/types/types'
import {
    TransactionEventType,
    TransactionStateType,
    useAccount,
    useGasPrice,
    useNonce,
    useTransactionState,
} from '@masknet/web3-shared'
import { useITO_Contract } from './useITO_Contract'

export function useDestructCallback(ito_address: string) {
    const nonce = useNonce()
    const gasPrice = useGasPrice()
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
                gasPrice,
                nonce,
            }

            // send transaction and wait for hash
            return new Promise<string>((resolve, reject) => {
                const onConfirm = (no: number, receipt: TransactionReceipt) => {
                    setDestructState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                    resolve(receipt.transactionHash)
                }
                const onFailed = (error: Error) => {
                    setDestructState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                }
                const promiEvent = ITO_Contract.methods.destruct(id).send(config as NonPayableTx)
                promiEvent.on(TransactionEventType.CONFIRMATION, onConfirm).on(TransactionEventType.ERROR, onFailed)
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
