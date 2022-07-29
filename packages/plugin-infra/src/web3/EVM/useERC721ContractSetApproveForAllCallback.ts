import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import { useChainId } from '../../entry-web3'
import { useWeb3Connection } from '../useWeb3Connection'
import { useAccount } from '../useAccount'
import { useERC721TokenContract } from './useERC721TokenContract'

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
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM, _chainId)
    const erc721TokenContract = useERC721TokenContract(chainId, contractAddress)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId: _chainId })

    return useAsyncFn(async () => {
        if (!erc721TokenContract || !contractAddress || !operator || !connection) {
            return
        }

        const hash = await connection?.approveAllNonFungibleTokens(contractAddress, operator, approved)
        const receipt = await connection.getTransactionReceipt(hash)
        if (receipt) {
            callback?.()
        }
    }, [account, chainId, erc721TokenContract, approved, contractAddress, operator, connection])
}
