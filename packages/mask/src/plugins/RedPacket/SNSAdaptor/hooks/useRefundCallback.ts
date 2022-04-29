import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { TransactionEventType } from '@masknet/web3-shared-evm'
import { useCallback, useState } from 'react'
import { useRedPacketContract } from './useRedPacketContract'

export function useRefundCallback(
    version: number,
    from: string,
    id?: string,
): [loading: boolean, isRefunded: boolean, refund: () => Promise<string | undefined>] {
    const [loading, setLoading] = useState(false)
    const [isRefunded, setIsRefunded] = useState(false)
    const redPacketContract = useRedPacketContract(version)

    const refundCallback = useCallback(async () => {
        if (!redPacketContract || !id) return

        setLoading(true)
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
                    setLoading(false)
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
        }).finally(() => setLoading(false))
    }, [id, redPacketContract, from])

    return [loading, isRefunded, refundCallback]
}
