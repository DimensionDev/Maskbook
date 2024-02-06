import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import type { RedPacketNftJSONPayload } from '@masknet/web3-providers/types'
import { toFixed } from '@masknet/web3-shared-base'
import { ContractTransaction } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import { useNftRedPacketContract } from './useNftRedPacketContract.js'
import { useSignedMessage } from './useSignedMessage.js'

const EXTRA_GAS_PER_NFT = 335

/**
 * Claim NFT red packet.
 */
export function useClaimNftRedpacketCallback(
    account: string,
    payload: RedPacketNftJSONPayload = {} as RedPacketNftJSONPayload,
    totalAmount: number | undefined,
) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const nftRedPacketContract = useNftRedPacketContract(chainId)
    const { refetch } = useSignedMessage(account, payload)
    const id = payload.id
    return useAsyncFn(async () => {
        if (!nftRedPacketContract || !id || !account || !totalAmount) return
        const { data: signedMsg } = await refetch()
        if (!signedMsg) return

        const transaction = nftRedPacketContract.methods.claim(id, signedMsg, account)
        const tx = await new ContractTransaction(nftRedPacketContract).fillAll(transaction, {
            from: account,
            gas: toFixed((await transaction.estimateGas({ from: account })) + EXTRA_GAS_PER_NFT * totalAmount),
            chainId,
        })
        return EVMWeb3.sendTransaction(tx, { chainId })
    }, [id, account, chainId, totalAmount, refetch])
}
