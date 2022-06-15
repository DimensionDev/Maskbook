import { useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useRedPacketContract } from './useRedPacketContract'
import { TransactionEventType } from '@masknet/web3-shared-evm'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function useRefundCallback(version: number, from: string, id?: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [isRefunded, setIsRefunded] = useState(false)
    const redPacketContract = useRedPacketContract(chainId, version)

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
