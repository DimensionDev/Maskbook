import { useAsyncFn } from 'react-use'
import { NetworkPluginID, TimeoutController } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { useERC721TokenContract } from './useERC721TokenContract.js'

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
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId: _chainId,
    })
    const erc721TokenContract = useERC721TokenContract(chainId, contractAddress)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId: _chainId })

    return useAsyncFn(async () => {
        if (!erc721TokenContract || !contractAddress || !operator || !connection) {
            return
        }

        const hash = await connection?.approveAllNonFungibleTokens(contractAddress, operator, approved)
        const receipt = await connection.confirmTransaction(hash, {
            signal: new TimeoutController(5 * 60 * 1000).signal,
        })

        if (receipt) {
            callback?.()
        }
    }, [account, chainId, erc721TokenContract, approved, contractAddress, operator, connection])
}
