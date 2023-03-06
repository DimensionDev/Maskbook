import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { safeNonPayableTransactionCall } from '@masknet/web3-shared-evm'
import { useERC721TokenContract } from './useERC721TokenContract.js'

/**
 * @param contractAddress NFT contract address.
 * @param owner The address that owns the NFTs.
 * @param operator The address that acts on behalf of the owner.
 * @return True if `operator` is an approved operator for `owner`, false otherwise.
 */
export function useERC721ContractIsApproveForAll(
    contractAddress: string | undefined,
    owner: string | undefined,
    operator: string | undefined,
    expectedChainId: ChainId,
) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })
    const erc721TokenContract = useERC721TokenContract(chainId, contractAddress)
    return useAsyncRetry(async () => {
        if (!erc721TokenContract || !owner || !operator) return
        return safeNonPayableTransactionCall(erc721TokenContract.methods.isApprovedForAll(owner, operator))
    }, [erc721TokenContract, owner, operator])
}
