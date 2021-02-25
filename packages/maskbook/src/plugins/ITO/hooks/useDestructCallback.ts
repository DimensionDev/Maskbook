import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import type { Tx } from '@dimensiondev/contracts/types/types'
import { addGasMargin } from '../../../web3/helpers'
import { useAccount } from '../../../web3/hooks/useAccount'
import type { TransactionReceipt } from 'web3-core'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { TransactionEventType } from '../../../web3/types'
import { useITO_Contract } from '../contracts/useITO_Contract'

export function useDestructCallback(isMask: boolean) {
    const account = useAccount()
    const ITO_Contract = useITO_Contract(isMask)
    const [destructState, setDestructState] = useTransactionState()

    const destructCallback = useCallback(
        async (id: string) => {
            if (!ITO_Contract || !id) {
                setDestructState({
                    type: TransactionStateType.UNKNOWN,
                })
                return
            }

            // pre-step: start waiting for provider to confirm tx
            setDestructState({
                type: TransactionStateType.WAIT_FOR_CONFIRMING,
            })

            const config: Tx = {
                from: account,
                to: ITO_Contract.options.address,
            }

            // step 1: estimate gas
            const estimatedGas = await ITO_Contract.methods
                .destruct(id)
                .estimateGas(config)
                .catch((error: Error) => {
                    setDestructState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    throw error
                })

            // step 2-1: blocking
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
                const promiEvent = ITO_Contract.methods.destruct(id).send({
                    gas: addGasMargin(new BigNumber(estimatedGas)).toFixed(),
                    ...config,
                })

                promiEvent.on(TransactionEventType.ERROR, onFailed)
                promiEvent.on(TransactionEventType.CONFIRMATION, onConfirm)
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
