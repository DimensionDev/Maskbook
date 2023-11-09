import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { EVMContract } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { safeNonPayableTransactionCall } from '@masknet/web3-shared-evm'

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
    return useAsyncRetry(async () => {
        if (!owner || !operator || !contractAddress) return

        return safeNonPayableTransactionCall(
            EVMContract.getERC721Contract(contractAddress, { chainId })?.methods.isApprovedForAll(owner, operator),
        )
    }, [owner, operator])
}
