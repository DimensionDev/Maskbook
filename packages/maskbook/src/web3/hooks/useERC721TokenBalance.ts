import { useAsyncRetry } from 'react-use'
import { useAccount } from './useAccount'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useChainId } from './useChainId'
import { useBlockNumber } from './useBlockNumber'

/**
 * Fetch token balance from chain
 * @param token
 */
export function useERC721TokenBalance(address: string) {
    const chainId = useChainId()
    const account = useAccount()
    const blockNumber = useBlockNumber()
    const erc721TokenContract = useERC721TokenContract(address)
    return useAsyncRetry(async () => {
        if (!account || !erc721TokenContract) return undefined
        return erc721TokenContract.methods.balanceOf(account).call()
    }, [account, blockNumber, chainId, address, erc721TokenContract])
}
