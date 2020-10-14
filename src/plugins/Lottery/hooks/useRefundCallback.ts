import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { useLotteryContract } from '../contracts/useLotteryContract'
import { useTransactionState, TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { useAccount } from '../../../web3/hooks/useAccount'
import type { Tx } from '../../../contracts/types'
import { addGasMargin } from '../../../web3/helpers'
import type { TransactionReceipt } from 'web3-core'

export function useRefundCallback(id?: string) {
    const account = useAccount()
    const [refundState, setRefundState] = useTransactionState()
    const lotteryContract = useLotteryContract()

    const refundCallback = useCallback(async () => {
        if (!lotteryContract || !id) {
            setRefundState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setRefundState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config: Tx = {
            from: account,
            to: lotteryContract.options.address,
        }
        const params: Parameters<typeof lotteryContract['methods']['refund']> = [id]

        // step 1: estimate gas
        const estimatedGas = await lotteryContract.methods
            .refund(...params)
            .estimateGas(config)
            .catch((error: Error) => {
                setRefundState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            const promiEvent = lotteryContract.methods.refund(...params).send({
                gas: addGasMargin(new BigNumber(estimatedGas)).toFixed(),
                ...config,
            })
            promiEvent.on('receipt', (receipt: TransactionReceipt) => {
                setRefundState({
                    type: TransactionStateType.RECEIPT,
                    receipt,
                })
            })
            promiEvent.on('confirmation', (no: number, receipt: TransactionReceipt) => {
                setRefundState({
                    type: TransactionStateType.CONFIRMED,
                    no,
                    receipt,
                })
                resolve()
            })
            promiEvent.on('error', reject)
        })
    }, [id, lotteryContract])

    return [refundState, refundCallback] as const
}
