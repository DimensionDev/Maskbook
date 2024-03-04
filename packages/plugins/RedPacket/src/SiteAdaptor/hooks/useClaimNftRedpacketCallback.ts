import { useAsyncFn } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import { ContractTransaction } from '@masknet/web3-shared-evm'
import { useChainContext } from '@masknet/web3-hooks-base'
import { toFixed } from '@masknet/web3-shared-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { useNftRedPacketContract } from './useNftRedPacketContract.js'

const EXTRA_GAS_PER_NFT = 335

export function useClaimNftRedpacketCallback(id: string, totalAmount: number | undefined, signedMsg: string) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const nftRedPacketContract = useNftRedPacketContract(chainId)
    return useAsyncFn(async (): Promise<string | undefined | Error> => {
        if (!nftRedPacketContract || !id || !signedMsg || !account || !totalAmount) return

        const transaction = nftRedPacketContract.methods.claim(id, signedMsg, account)
        const estimatedGas = await transaction.estimateGas({ from: account })
        const tx = await new ContractTransaction(nftRedPacketContract).fillAll(transaction, {
            from: account,
            gas: toFixed(estimatedGas + EXTRA_GAS_PER_NFT * totalAmount),
            chainId,
        })
        return EVMWeb3.sendTransaction(tx, { chainId })
    }, [id, signedMsg, account, chainId, totalAmount])
}
