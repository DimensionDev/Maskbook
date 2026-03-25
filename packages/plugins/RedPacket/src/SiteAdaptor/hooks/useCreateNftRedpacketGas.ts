import { useMemo } from 'react'
import { toHex, type NetworkPluginID } from '@masknet/shared-base'
import type { NftRedPacket } from '@masknet/web3-contracts/types/NftRedPacket.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import { toFixed } from '@masknet/web3-shared-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { useNftRedPacketContract } from './useNftRedPacketContract.js'
import { useQuery } from '@tanstack/react-query'
import { keccak256 } from 'viem'

export function useCreateNFTRedpacketGas(
    message: string,
    name: string,
    contractAddress: string,
    tokenIdList: string[],
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const nftRedPacketContract = useNftRedPacketContract(chainId)

    const { account: publicKey } = useMemo(() => EVMWeb3.createAccount(), [])
    return useQuery({
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: [
            'create-nft-red-packet',
            'gas',
            chainId,
            contractAddress,
            account,
            publicKey,
            name,
            message,
            tokenIdList,
        ],
        refetchInterval: 10,
        queryFn: async () => {
            if (!nftRedPacketContract || !account) return null

            type FillMethodParameters = Parameters<NftRedPacket['methods']['create_red_packet']>
            const params: FillMethodParameters = [
                publicKey,
                60 * 60 * 24,
                keccak256(toHex(Math.random().toString())),
                message,
                name,
                contractAddress,
                tokenIdList,
            ]

            return toFixed(
                await nftRedPacketContract.methods.create_red_packet(...params).estimateGas({ from: account }),
            )
        },
    })
}
