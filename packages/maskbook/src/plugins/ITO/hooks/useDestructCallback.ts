import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import { addGasMargin } from '../../../web3/helpers'
import { useAccount } from '../../../web3/hooks/useAccount'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { useITO_Contract } from '../contracts/useITO_Contract'
import Services from '../../../extension/service'
import type { TransactionReceipt, TransactionRequest } from '@ethersproject/abstract-provider'
import { StageType } from '../../../web3/types'

export function useDestructCallback() {
    const account = useAccount()
    const ITO_Contract = useITO_Contract()
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

            const config: TransactionRequest = {
                from: account,
                to: ITO_Contract.options.address,
            }

            // step 1: estimate gas
            const estimatedGas = await ITO_Contract.estimateGas.destruct(id).catch((error: Error) => {
                setDestructState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

            // step 2-1: blocking
            return new Promise<string>(async (resolve, reject) => {
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
                const transaction = await ITO_Contract.destruct(id, {
                    gasLimit: addGasMargin(new BigNumber(estimatedGas)).toString(),
                })

                for await (const stage of Services.Ethereum.watchTransaction(account, transaction)) {
                    switch (stage.type) {
                        case StageType.CONFIRMATION:
                            onConfirm(stage.no, stage.receipt)
                            break
                        case StageType.ERROR:
                            onFailed(stage.error)
                            break
                    }
                }
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
