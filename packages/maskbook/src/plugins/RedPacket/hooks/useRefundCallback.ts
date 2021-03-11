import { useCallback } from 'react'
import { useRedPacketContract } from '../contracts/useRedPacketContract'
import { useTransactionState, TransactionStateType } from '../../../web3/hooks/useTransactionState'
import Services from '../../../extension/service'
import { useAccount } from '../../../web3/hooks/useAccount'
import type { TransactionRequest } from '@ethersproject/abstract-provider'
import { StageType } from '../../../web3/types'

export function useRefundCallback(from: string, id?: string) {
    const account = useAccount()
    const [refundState, setRefundState] = useTransactionState()
    const redPacketContract = useRedPacketContract()

    const refundCallback = useCallback(async () => {
        if (!redPacketContract || !id) {
            setRefundState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setRefundState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const request: TransactionRequest = {
            from,
            to: redPacketContract.options.address,
        }
        const params: Parameters<typeof redPacketContract['refund']> = [id]

        // step 1: estimate gas
        const estimatedGas = await redPacketContract.estimateGas.refund(...params).catch((error) => {
            setRefundState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

        // step 2: blocking
        return new Promise<string>(async (resolve, reject) => {
            const transaction = await redPacketContract.refund(...params)
            for await (const stage of Services.Ethereum.watchTransaction(account, transaction)) {
                switch (stage.type) {
                    case StageType.TRANSACTION_HASH:
                        setRefundState({
                            type: TransactionStateType.HASH,
                            hash: stage.hash,
                        })
                        resolve(stage.hash)
                        break
                    case StageType.ERROR:
                        setRefundState({
                            type: TransactionStateType.FAILED,
                            error: stage.error,
                        })
                        reject(stage.error)
                        break
                }
            }
        })
    }, [id, account, redPacketContract])

    const resetCallback = useCallback(() => {
        setRefundState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [refundState, refundCallback, resetCallback] as const
}
