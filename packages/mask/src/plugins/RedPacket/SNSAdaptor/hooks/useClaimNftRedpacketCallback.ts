import { useAsyncFn } from 'react-use'
import { NetworkPluginID } from '@masknet/shared-base'
import { ContractTransaction } from '@masknet/web3-shared-evm'
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import type { NftRedPacket } from '@masknet/web3-contracts/types/NftRedPacket.js'
import { useNftRedPacketContract } from './useNftRedPacketContract.js'

const EXTRA_GAS_PER_NFT = 335

export function useClaimNftRedpacketCallback(id: string, totalAmount: number | undefined, signedMsg: string) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const nftRedPacketContract = useNftRedPacketContract(chainId)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    return useAsyncFn(async () => {
        if (!connection || !nftRedPacketContract || !id || !signedMsg || !account || !totalAmount) {
            return
        }

        type MethodParameters = Parameters<NftRedPacket['methods']['claim']>

        const params: MethodParameters = [id, signedMsg, account]
        const tx = await new ContractTransaction(nftRedPacketContract).encodeWithGas(
            nftRedPacketContract.methods.claim(...params),
            {
                from: account,
                gas:
                    (await nftRedPacketContract.methods
                        .claim(...params)
                        .estimateGas({ from: account })
                        .catch((error) => {
                            throw error
                        })) +
                    EXTRA_GAS_PER_NFT * totalAmount,
                chainId,
            },
        )
        return connection.sendTransaction(tx)
    }, [id, connection, signedMsg, account, chainId, totalAmount])
}
