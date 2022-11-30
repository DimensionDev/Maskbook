import { useAsyncFn } from 'react-use'
import { NetworkPluginID } from '@masknet/shared-base'
import { ContractTransaction } from '@masknet/web3-shared-evm'
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { useNftRedPacketContract } from './useNftRedPacketContract.js'
import { toFixed } from '@masknet/web3-shared-base'

const EXTRA_GAS_PER_NFT = 335

export function useClaimNftRedpacketCallback(id: string, totalAmount: number | undefined, signedMsg: string) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const nftRedPacketContract = useNftRedPacketContract(chainId)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    return useAsyncFn(async () => {
        if (!connection || !nftRedPacketContract || !id || !signedMsg || !account || !totalAmount) {
            return
        }

        const transaction = await nftRedPacketContract.methods.claim(id, signedMsg, account)
        const estimated = await transaction.estimateGas({ from: account })
        const tx = await new ContractTransaction(nftRedPacketContract).fillAll(transaction, {
            from: account,
            gas: toFixed(estimated + EXTRA_GAS_PER_NFT * totalAmount),
            chainId,
        })
        return connection.sendTransaction(tx)
    }, [id, connection, signedMsg, account, chainId, totalAmount])
}
