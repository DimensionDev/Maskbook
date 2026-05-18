import { ChainId, getNftRedPacketConstant, useNftRedPacketConstants } from '@masknet/web3-shared-evm'
import { NftRedPacketAbi, type NftRedPacket } from '@masknet/web3-contracts/types/NftRedPacket.js'
import { useContract } from '@masknet/web3-hooks-evm'
import { EVMWeb3 } from '@masknet/web3-providers'
import { getContract } from 'viem'

export function useNftRedPacketContract(chainId: ChainId) {
    const { RED_PACKET_NFT_ADDRESS } = useNftRedPacketConstants(chainId)
    return useContract<NftRedPacket>(chainId, RED_PACKET_NFT_ADDRESS, NftRedPacketAbi)
}

export function createNftRedpacketContract(chainId: ChainId | undefined) {
    const RED_PACKET_NFT_ADDRESS = getNftRedPacketConstant(chainId ?? ChainId.Mainnet, 'RED_PACKET_NFT_ADDRESS')
    if (!RED_PACKET_NFT_ADDRESS) return null
    return getContract({
        abi: NftRedPacketAbi,
        client: EVMWeb3.getViem({ chainId }),
        address: RED_PACKET_NFT_ADDRESS as HexString,
    })
}
