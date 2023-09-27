import { useAsyncRetry } from 'react-use'
import type { AbiItem } from 'web3-utils'
import type { BigNumber } from 'bignumber.js'
import { decodeEvents, useRedPacketConstants } from '@masknet/web3-shared-evm'
import REDPACKET_ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Web3 } from '@masknet/web3-providers'

export function useCreateRedPacketReceipt(txid: string) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants(chainId)

    return useAsyncRetry(async () => {
        if (!txid) return null

        const receipt = await Web3.getTransactionReceipt(txid, { chainId })
        if (!receipt) return null

        const log = receipt.logs.find((log) => isSameAddress(log.address, HAPPY_RED_PACKET_ADDRESS_V4))
        if (!log) return null

        const eventParams = decodeEvents(REDPACKET_ABI as AbiItem[], [log]) as unknown as {
            CreationSuccess: {
                id: string
                creation_time: BigNumber
            }
        }

        return {
            rpid: eventParams['CreationSuccess'].id ?? '',
            creation_time: eventParams['CreationSuccess'].creation_time.toNumber() * 1000,
        }
    }, [txid, HAPPY_RED_PACKET_ADDRESS_V4, chainId])
}
