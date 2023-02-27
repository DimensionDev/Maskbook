import { NetworkPluginID } from '@masknet/shared-base'
import type { NftRedPacket } from '@masknet/web3-contracts/types/NftRedPacket.js'
import { useChainContext, useWeb3 } from '@masknet/web3-hooks-base'
import { toFixed } from '@masknet/web3-shared-base'
import { useMemo } from 'react'
import { useAsync } from 'react-use'
import Web3Utils from 'web3-utils'
import { useNftRedPacketContract } from './useNftRedPacketContract.js'

export function useCreateNFTRedpacketGas(
    message: string,
    name: string,
    contractAddress: string,
    tokenIdList: string[],
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const nftRedPacketContract = useNftRedPacketContract(chainId)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)

    const { address: publicKey } = useMemo(() => web3?.eth.accounts.create() ?? { address: '', privateKey: '' }, [web3])

    return useAsync(async () => {
        if (!web3 || !nftRedPacketContract || !account) return

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
    }, [account, web3, contractAddress, message, name, JSON.stringify(tokenIdList), nftRedPacketContract, publicKey])
}
