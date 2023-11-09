import { useAsyncFn } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { EVMWeb3 } from '@masknet/web3-providers'
import { useChainContext } from '@masknet/web3-hooks-base'

/**
 * @param contractAddress NFT contract Address.
 * @param operator Address to add to the set of authorized operators.
 * @param approved True if the operator is approved, false to revoke approval.
 */
export function useERC721ContractSetApproveForAllCallback(
    contractAddress: string | undefined,
    operator: string | undefined,
    approved: boolean,
    callback?: () => void,
    _chainId?: ChainId,
) {
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId: _chainId,
    })

    return useAsyncFn(async () => {
        if (!contractAddress || !operator) return

        const hash = await EVMWeb3.approveAllNonFungibleTokens(contractAddress, operator, approved, undefined, {
            chainId: _chainId,
        })
        const receipt = await EVMWeb3.confirmTransaction(hash, {
            chainId: _chainId,
            signal: AbortSignal.timeout(5 * 60 * 1000),
        })

        if (receipt) callback?.()
    }, [account, approved, contractAddress, operator])
}
