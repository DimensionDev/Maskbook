import { useAsyncFn } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import { ContractTransaction, signMessage } from '@masknet/web3-shared-evm'
import { useChainContext } from '@masknet/web3-hooks-base'
import { toFixed } from '@masknet/web3-shared-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { useNftRedPacketContract } from './useNftRedPacketContract.js'
import type { RedPacketNftJSONPayload } from '@masknet/web3-providers/types'
import { useSignedMessage } from './useSignedMessage.js'
import { useMemo } from 'react'

const EXTRA_GAS_PER_NFT = 335

export function useClaimNftRedpacketCallback(payload: RedPacketNftJSONPayload, totalAmount: number | undefined) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const nftRedPacketContract = useNftRedPacketContract(chainId)
    const { refetch } = useSignedMessage(account, payload)
    const id = payload.id
    const signedMsg = useMemo(() => {
        return signMessage(account, payload.privateKey).signature ?? ''
    }, [account, payload.privateKey])
    return useAsyncFn(async (): Promise<string | undefined | Error> => {
        if (!nftRedPacketContract || !id || !account || !totalAmount || !signedMsg) return

        const transaction = nftRedPacketContract.methods.claim(id, signedMsg, account)
        const estimatedGas = await transaction.estimateGas({ from: account })
        const tx = await new ContractTransaction(nftRedPacketContract).fillAll(transaction, {
            from: account,
            gas: toFixed(estimatedGas + EXTRA_GAS_PER_NFT * totalAmount),
            chainId,
        })
        return EVMWeb3.sendTransaction(tx, { chainId })
    }, [id, refetch, account, chainId, totalAmount, signedMsg])
}
