import { useAsyncRetry } from 'react-use'
import type { BigNumber } from 'bignumber.js'
import { Interface } from '@ethersproject/abi'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useNftRedPacketConstants } from '@masknet/web3-shared-evm'
import NFT_REDPACKET_ABI from '@masknet/web3-contracts/abis/NftRedPacket.json'
import { useChainContext } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Web3 } from '@masknet/web3-providers'

const interFace = new Interface(NFT_REDPACKET_ABI)

export function useCreateNftRedPacketReceipt(txid: string) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { RED_PACKET_NFT_ADDRESS } = useNftRedPacketConstants(chainId)

    return useAsyncRetry(async () => {
        const receipt = await Web3.getTransactionReceipt(txid)
        if (!receipt) return null

        const log = receipt.logs.find((log) => isSameAddress(log.address, RED_PACKET_NFT_ADDRESS))
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
    }, [txid, RED_PACKET_NFT_ADDRESS])
}
