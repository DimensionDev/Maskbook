import { NetworkPluginID } from '@masknet/shared-base'
import { useEnvironmentContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    type AbiEventToPrimitiveType,
    type ChainId,
    decodeEvents,
    useRedPacketConstants,
} from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { getRedpacket } from '../helpers/getRedpacket.js'
import { HappyRedPacketV4Abi } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'

export function useCreateRedPacketReceipt(txHashOrAccountId: string, chainId: ChainId, enabled?: boolean) {
    const { pluginID } = useEnvironmentContext()
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants(chainId)
    const Web3 = useWeb3Connection(pluginID)

    return useQuery({
        enabled,
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ['redpacket', 'creation-success-params', chainId, txHashOrAccountId],
        queryFn: async (): Promise<AbiEventToPrimitiveType<HappyRedPacketV4Abi, 'CreationSuccess'> | null> => {
            if (!txHashOrAccountId || !Web3) return null

            if (pluginID === NetworkPluginID.PLUGIN_EVM) {
                const receipt = await Web3.getTransactionReceipt(txHashOrAccountId, { chainId })
                if (!receipt) return null

                const log = receipt.logs.find((log) => isSameAddress(log.address, HAPPY_RED_PACKET_ADDRESS_V4))
                if (!log) return null

                const eventParams = decodeEvents(HappyRedPacketV4Abi, [log])
                return eventParams.CreationSuccess!.returnValues
            }
            const result = await getRedpacket(txHashOrAccountId)

            return {
                id: txHashOrAccountId as `0x${string}`,
                creation_time: BigInt(result.createTime.toString()),
                creator: result.creator.toBase58() as `0x${string}`,
                duration: 86400n,
                ifrandom: result.ifSpiltRandom,
                message: result.message,
                name: result.name,
                number: BigInt(result.totalNumber.toString()),
                token_address: result.tokenAddress.toBase58() as `0x${string}`,
                total: BigInt(result.totalAmount.toString()),
            }
        },
    })
}
