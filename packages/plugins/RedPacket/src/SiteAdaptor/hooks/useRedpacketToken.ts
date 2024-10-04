import { NetworkPluginID } from '@masknet/shared-base'
import HappyRedPacketV4ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import { useWeb3, useWeb3Connection } from '@masknet/web3-hooks-base'

import { CREATE_LUCKY_DROP_TOPIC } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'

/**
 * Get redpacket token address from transaction logs
 */
export function useRedpacketToken(chainId: ChainId, hash: string, enabled?: boolean) {
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })
    const web3Conn = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    const inputs = HappyRedPacketV4ABI!.find((x) => x.name === 'CreationSuccess' && x.type === 'event')?.inputs
    return useQuery({
        enabled,
        queryKey: ['redpacket', 'token', chainId, hash],
        queryFn: async () => {
            const receipt = await web3Conn.getTransactionReceipt(hash)
            if (!receipt || !inputs) return null
            if (!web3) return
            const log = receipt.logs.find((x) => x.topics[0] === CREATE_LUCKY_DROP_TOPIC)
            if (!log) return null

            const result = web3.eth.abi.decodeLog(inputs, log.data, log?.topics)
            return result.token_address
        },
    })
}
