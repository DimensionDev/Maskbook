import { useAsyncRetry } from 'react-use'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { safeNonPayableTransactionCall } from '../utils'

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
    const erc721TokenContract = useERC721TokenContract(contractAddress)
    return useAsyncRetry(async () => {
        if (!erc721TokenContract || !owner || !operator) return
        return safeNonPayableTransactionCall(erc721TokenContract.methods.isApprovedForAll(owner, operator))
    }, [erc721TokenContract, owner, operator])
}
