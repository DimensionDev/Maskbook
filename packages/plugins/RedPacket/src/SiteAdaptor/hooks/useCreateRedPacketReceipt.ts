import { NetworkPluginID } from '@masknet/shared-base'
import REDPACKET_ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import { useWeb3Connection } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { type ChainId, decodeEvents, useRedPacketConstants } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import type { AbiItem } from 'web3-utils'

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
export function useCreateRedPacketReceipt(txHash: string, chainId: ChainId) {
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants(chainId)
    const Web3 = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)

    return useQuery({
        queryKey: ['redpacket', 'creation-success-params', chainId, txHash],
        queryFn: async () => {
            if (!txHash || !Web3) return null

            const receipt = await Web3.getTransactionReceipt(txHash, { chainId })
            if (!receipt) return null

            const log = receipt.logs.find((log) => isSameAddress(log.address, HAPPY_RED_PACKET_ADDRESS_V4))
            if (!log) return null

            const eventParams = decodeEvents(REDPACKET_ABI as AbiItem[], [log]) as unknown as {
                CreationSuccess: {
                    returnValues: CreationSuccessEventParams
                }
            }

            return eventParams.CreationSuccess.returnValues
        },
    })
}
