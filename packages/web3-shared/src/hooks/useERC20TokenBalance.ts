import { useAsyncRetry } from 'react-use'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { useChainId } from './useChainId'
import { useBlockNumber } from './useBlockNumber'

/**
 * Fetch token balance from chain
 * @param token
 */
export function useERC20TokenBalance(address?: string) {
    const account = useAccount()
    const chainId = useChainId()
    const blockNumber = useBlockNumber()
    const erc20Contract = useERC20TokenContract(address)
    return useAsyncRetry(async () => {
        if (!account || !address || !erc20Contract) return undefined
        return erc20Contract.methods.balanceOf(account).call({
            from: account,
        })
    }, [account, blockNumber, chainId, address, erc20Contract])
}
