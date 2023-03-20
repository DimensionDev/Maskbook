import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useWeb3, useWeb3Connection } from '@masknet/web3-hooks-base'
import { Lens } from '@masknet/web3-providers'
import { ChainId, ContractTransaction, createContract, encodeTypedData, splitSignature } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import LensFollowNFTABI from '@masknet/web3-contracts/abis/LensFollowNFT.json'
import type { LensFollowNFT } from '@masknet/web3-contracts/types/LensFollowNFT.js'
import { useQueryAuthenticate } from './useQueryAuthenticate.js'
import { type AbiItem } from 'web3-utils'

export function useUnfollow(profileId?: string, onSuccess?: () => void) {
    const connection = useWeb3Connection()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [, handleQueryAuthenticate] = useQueryAuthenticate(account)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })

    return useAsyncFn(async () => {
        if (!profileId || !connection || chainId !== ChainId.Matic) return
        const token = await handleQueryAuthenticate()
        if (!token) return

        const typedData = await Lens.createUnfollowTypedData(profileId, { token })

        if (!typedData) return

        const signature = await connection.signMessage(
            'typedData',
            JSON.stringify(
                encodeTypedData(typedData.typedData.domain, typedData.typedData.types, typedData.typedData.value),
            ),
        )

        const { v, r, s } = splitSignature(signature)
        const { tokenId, deadline } = typedData.typedData.value

        const followNFTContract = createContract<LensFollowNFT>(
            web3,
            typedData.typedData.domain.verifyingContract,
            LensFollowNFTABI as AbiItem[],
        )
        const tx = await new ContractTransaction(followNFTContract).fillAll(
            followNFTContract?.methods.burnWithSig(tokenId, [v, r, s, deadline]),
            { from: account },
        )

        const hash = await connection.sendTransaction(tx)

        const result = await connection.confirmTransaction(hash, {
            signal: AbortSignal.timeout(3 * 60 * 1000),
        })

        if (!result.status) return

        onSuccess?.()
    }, [handleQueryAuthenticate, chainId, profileId, web3, account, onSuccess, connection])
}
