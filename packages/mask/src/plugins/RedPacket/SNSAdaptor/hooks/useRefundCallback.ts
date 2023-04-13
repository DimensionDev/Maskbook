import { useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { type ChainId, ContractTransaction } from '@masknet/web3-shared-evm'
import { useRedPacketContract } from './useRedPacketContract.js'

export function useRefundCallback(version: number, from: string, id?: string, expectedChainId?: ChainId) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })
    const [isRefunded, setIsRefunded] = useState(false)
    const redPacketContract = useRedPacketContract(chainId, version)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    const [state, refundCallback] = useAsyncFn(async () => {
        if (!connection || !redPacketContract || !id) return

        setIsRefunded(false)
        const tx = await new ContractTransaction(redPacketContract).fillAll(redPacketContract.methods.refund(id), {
            from,
        })
        const hash = await connection.sendTransaction(tx)
        setIsRefunded(true)
        return hash
    }, [id, redPacketContract, from, connection, chainId])

    return [state, isRefunded, refundCallback] as const
}
