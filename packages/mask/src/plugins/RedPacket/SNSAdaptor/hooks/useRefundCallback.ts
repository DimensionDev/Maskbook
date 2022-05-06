import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { TransactionEventType } from '@masknet/web3-shared-evm'
import { useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useRedPacketContract } from './useRedPacketContract'

export function useRefundCallback(version: number, from: string, id?: string) {
    const [isRefunded, setIsRefunded] = useState(false)
    const redPacketContract = useRedPacketContract(version)

    const [state, refundCallback] = useAsyncFn(async () => {
        if (!redPacketContract || !id) return

        setIsRefunded(false)
        // estimate gas and compose transaction
        const config = {
            from,
            gas: await redPacketContract.methods
                .refund(id)
                .estimateGas({
                    from,
                })
                .catch((error) => {
                    throw error
                }),
        }

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            redPacketContract.methods
                .refund(id)
                .send(config as NonPayableTx)
                .once(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                    setIsRefunded(true)
                })
                .once(TransactionEventType.ERROR, reject)
        })
    }, [id, redPacketContract, from])

    return [state, isRefunded, refundCallback] as const
}
