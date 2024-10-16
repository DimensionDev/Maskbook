import { useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { type ChainId, ContractTransaction } from '@masknet/web3-shared-evm'
import { EVMWeb3 } from '@masknet/web3-providers'
import { useRedPacketContract } from './useRedPacketContract.js'

export function useRefundCallback(version: number, from: string, id?: string, expectedChainId?: ChainId) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })
    const [isRefunded, setIsRefunded] = useState(false)
    const redPacketContract = useRedPacketContract(chainId, version)

    const [state, refundCallback] = useAsyncFn(async () => {
        if (!redPacketContract || !id) return

        setIsRefunded(false)

        const tx = await new ContractTransaction(redPacketContract).fillAll(redPacketContract.methods.refund(id), {
            from,
        })
        const hash = await EVMWeb3.sendTransaction(tx, {
            chainId,
        })
        setIsRefunded(true)
        return hash
    }, [id, redPacketContract, chainId, from])

    return [state, isRefunded, refundCallback] as const
}
