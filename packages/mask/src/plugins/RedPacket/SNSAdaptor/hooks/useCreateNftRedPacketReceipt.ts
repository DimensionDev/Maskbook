import { useAsyncRetry } from 'react-use'
import { Interface } from '@ethersproject/abi'
import type { BigNumber } from 'bignumber.js'
import { useNftRedPacketConstants } from '@masknet/web3-shared-evm'
import NFT_REDPACKET_ABI from '@masknet/web3-contracts/abis/NftRedPacket.json'
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID, isSameAddress } from '@masknet/web3-shared-base'

const interFace = new Interface(NFT_REDPACKET_ABI)

export function useCreateNftRedPacketReceipt(txid: string) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const { RED_PACKET_NFT_ADDRESS } = useNftRedPacketConstants(chainId)

    return useAsyncRetry(async () => {
        const result = await connection?.getTransactionReceipt(txid)
        if (!result) return null

        const log = result.logs.find((log) => isSameAddress(log.address, RED_PACKET_NFT_ADDRESS))
        if (!log) return null

        type CreationSuccessEventParams = {
            id: string
            creation_time: BigNumber
        }
        const eventParams = interFace.decodeEventLog(
            'CreationSuccess',
            log.data,
            log.topics,
        ) as unknown as CreationSuccessEventParams

        return {
            rpid: eventParams.id ?? '',
            creation_time: eventParams.creation_time.toNumber() * 1000,
        }
    }, [connection, txid, RED_PACKET_NFT_ADDRESS])
}
