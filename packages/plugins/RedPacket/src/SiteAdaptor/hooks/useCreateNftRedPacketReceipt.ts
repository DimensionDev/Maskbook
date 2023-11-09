import { useAsyncRetry } from 'react-use'
import type { BigNumber } from 'bignumber.js'
import type { AbiItem } from 'web3-utils'
import type { NetworkPluginID } from '@masknet/shared-base'
import { type ChainId, useNftRedPacketConstants, decodeEvents } from '@masknet/web3-shared-evm'
import NFT_REDPACKET_ABI from '@masknet/web3-contracts/abis/NftRedPacket.json'
import { useChainContext } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { EVMWeb3 } from '@masknet/web3-providers'

export function useCreateNftRedPacketReceipt(txid: string, expectedChainId: ChainId) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })
    const { RED_PACKET_NFT_ADDRESS } = useNftRedPacketConstants(chainId)

    return useAsyncRetry(async () => {
        const receipt = await EVMWeb3.getTransactionReceipt(txid, { chainId })
        if (!receipt) return null

        const log = receipt.logs.find((log) => isSameAddress(log.address, RED_PACKET_NFT_ADDRESS))
        if (!log) return null

        const eventParams = decodeEvents(NFT_REDPACKET_ABI as AbiItem[], [log]) as unknown as {
            CreationSuccess: {
                id: string
                creation_time: BigNumber
            }
        }

        return {
            rpid: eventParams.CreationSuccess.id ?? '',
            creation_time: eventParams.CreationSuccess.creation_time.toNumber() * 1000,
        }
    }, [txid, chainId, RED_PACKET_NFT_ADDRESS])
}
