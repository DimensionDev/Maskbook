import { useAsyncRetry } from 'react-use'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { safeNonPayableTransactionCall } from '@masknet/web3-shared-evm'
import { useERC721TokenContract } from './useERC721TokenContract'
import { useChainId } from '../useChainId'

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
) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const erc721TokenContract = useERC721TokenContract(chainId, contractAddress)
    return useAsyncRetry(async () => {
        if (!erc721TokenContract || !owner || !operator) return
        return safeNonPayableTransactionCall(erc721TokenContract.methods.isApprovedForAll(owner, operator))
    }, [erc721TokenContract, owner, operator])
}
