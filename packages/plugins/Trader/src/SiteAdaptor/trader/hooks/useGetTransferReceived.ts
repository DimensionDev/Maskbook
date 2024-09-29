import { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3 } from '@masknet/web3-hooks-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useCallback } from 'react'

/**
 * Transfer(address,address,uint256)
 */
const TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
export function useGetTransferReceived(chainId: ChainId) {
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })
    return useCallback(
        async (hash: string, receiver: string) => {
            const receipt = await web3?.eth.getTransactionReceipt(hash)
            const receiverTopic = `0x000000000000000000000000${receiver.slice(2)}`.toLowerCase()

            const log = receipt?.logs.find((x) => {
                return x.topics.length === 3 && x.topics[0] === TOPIC && x.topics[2].toLowerCase() === receiverTopic
            })

            return log?.data
        },
        [web3],
    )
}
