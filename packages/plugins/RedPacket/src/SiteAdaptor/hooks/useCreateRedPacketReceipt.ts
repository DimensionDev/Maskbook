import type { AbiItem } from 'web3-utils'
import { decodeEvents, useRedPacketConstants } from '@masknet/web3-shared-evm'
import REDPACKET_ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'

type Result = { rpid: string; creation_time: number } | null

export function useCreateRedPacketReceipt(txid: string): UseQueryResult<Result> {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants(chainId)

    const query = useQuery({
        queryKey: ['red-packet-create-receipt', chainId, txid],
        queryFn: async () => {
            if (!txid) return null

            const receipt = await EVMWeb3.getTransactionReceipt(txid, { chainId })
            if (!receipt) return null

            const log = receipt.logs.find((log) => isSameAddress(log.address, HAPPY_RED_PACKET_ADDRESS_V4))
            if (!log) return null

            const eventParams = decodeEvents(REDPACKET_ABI as AbiItem[], [log]) as unknown as {
                CreationSuccess: {
                    returnValues: {
                        id: string
                        creation_time: string
                    }
                }
            }
            const { returnValues } = eventParams.CreationSuccess

            return {
                rpid: returnValues.id || '',
                creation_time: Number.parseInt(returnValues.creation_time, 10) * 1000,
            } satisfies Result
        },
    })
    return query
}
