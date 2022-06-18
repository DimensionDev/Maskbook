import { useChainId, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { encodeContractTransaction } from '@masknet/web3-shared-evm'
import { useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useRedPacketContract } from './useRedPacketContract'

export function useRefundCallback(version: number, from: string, id?: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [isRefunded, setIsRefunded] = useState(false)
    const redPacketContract = useRedPacketContract(chainId, version)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)

    const [state, refundCallback] = useAsyncFn(async () => {
        if (!redPacketContract || !id) return

        setIsRefunded(false)
        const config = {
            from,
        }
        const tx = await encodeContractTransaction(redPacketContract, redPacketContract.methods.refund(id), config)
        const hash = await connection.sendTransaction(tx)
        setIsRefunded(true)
        return hash
    }, [id, redPacketContract, from, connection])

    return [state, isRefunded, refundCallback] as const
}
