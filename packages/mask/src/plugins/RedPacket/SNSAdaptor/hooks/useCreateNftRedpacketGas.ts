import { useMemo } from 'react'
import { useAsync } from 'react-use'
import Web3Utils from 'web3-utils'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { NftRedPacket } from '@masknet/web3-contracts/types/NftRedPacket.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import { toFixed } from '@masknet/web3-shared-base'
import { Web3 } from '@masknet/web3-providers'
import { useNftRedPacketContract } from './useNftRedPacketContract.js'

export function useCreateNFTRedpacketGas(
    message: string,
    name: string,
    contractAddress: string,
    tokenIdList: string[],
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const nftRedPacketContract = useNftRedPacketContract(chainId)

    const { account: publicKey } = useMemo(() => Web3.createAccount(), [])

    return useAsync(async () => {
        if (!nftRedPacketContract || !account) return

        type FillMethodParameters = Parameters<NftRedPacket['methods']['create_red_packet']>
        const params: FillMethodParameters = [
            publicKey,
            60 * 60 * 24,
            Web3Utils.sha3(Math.random().toString())!,
            message,
            name,
            contractAddress,
            tokenIdList,
        ]

        return toFixed(await nftRedPacketContract?.methods.create_red_packet(...params).estimateGas({ from: account }))
    }, [account, contractAddress, message, name, JSON.stringify(tokenIdList), nftRedPacketContract, publicKey])
}
