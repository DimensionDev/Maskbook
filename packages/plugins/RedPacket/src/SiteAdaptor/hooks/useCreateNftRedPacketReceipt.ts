import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import { type ChainId, useNftRedPacketConstants, decodeEvents } from '@masknet/web3-shared-evm'
import { useChainContext } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { NftRedPacketAbi } from '@masknet/web3-contracts/types/NftRedPacket.js'

export function useCreateNftRedPacketReceipt(txid: string, expectedChainId: ChainId) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })
    const { RED_PACKET_NFT_ADDRESS } = useNftRedPacketConstants(chainId)

    return useAsyncRetry(async () => {
        if (!txid) return null
        const receipt = await EVMWeb3.getTransactionReceipt(txid, { chainId })
        if (!receipt) return null

        const log = receipt.logs.find((log) => isSameAddress(log.address, RED_PACKET_NFT_ADDRESS))
        if (!log) return null

        const eventParams = decodeEvents(NftRedPacketAbi, [log])

        const { returnValues } = eventParams.CreationSuccess!
        return {
            rpid: returnValues.id,
            creation_time: Number(returnValues.creation_time * 1000n),
        }
    }, [txid, chainId, RED_PACKET_NFT_ADDRESS])
}
