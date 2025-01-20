import { NetworkPluginID } from '@masknet/shared-base'
import REDPACKET_ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json' with { type: 'json' }
import { useEnvironmentContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { type ChainId, decodeEvents, useRedPacketConstants } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import type { AbiItem } from 'web3-utils'
import { getRedpacket } from '../helpers/getRedpacket.js'

type CreationSuccessEventParams = {
    id: string
    /** seconds in string */
    creation_time: string
    /** creator wallet address */
    creator: string
    /** seconds in string */
    duration: '86400'
    ifrandom: boolean
    message: string
    /** creator's name */
    name: string
    /** account in string*/
    number: string
    token_address: HexString
    /** account in string*/
    total: string
}
export function useCreateRedPacketReceipt(txHashOrAccountId: string, chainId: ChainId, enabled?: boolean) {
    const { pluginID } = useEnvironmentContext()
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants(chainId)
    const Web3 = useWeb3Connection(pluginID)

    return useQuery({
        enabled,
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ['redpacket', 'creation-success-params', chainId, txHashOrAccountId],
        queryFn: async () => {
            if (!txHashOrAccountId || !Web3) return null

            if (pluginID === NetworkPluginID.PLUGIN_EVM) {
                const receipt = await Web3.getTransactionReceipt(txHashOrAccountId, { chainId })
                if (!receipt) return null

                const log = receipt.logs.find((log) => isSameAddress(log.address, HAPPY_RED_PACKET_ADDRESS_V4))
                if (!log) return null

                const eventParams = decodeEvents(REDPACKET_ABI as AbiItem[], [log]) as unknown as {
                    CreationSuccess: {
                        returnValues: CreationSuccessEventParams
                    }
                }

                return eventParams.CreationSuccess.returnValues
            }
            const result = await getRedpacket(txHashOrAccountId)

            return {
                id: txHashOrAccountId,
                creation_time: result.createTime.toString(),
                creator: result.creator.toBase58(),
                duration: '86400',
                ifrandom: result.ifSpiltRandom,
                message: result.message,
                name: result.name,
                number: result.totalNumber.toString(),
                token_address: result.tokenAddress.toBase58(),
                total: result.totalAmount.toString(),
            }
        },
    })
}
