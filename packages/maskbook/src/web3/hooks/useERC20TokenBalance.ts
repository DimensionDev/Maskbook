import { useAsyncRetry } from 'react-use'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { useChainId } from './useChainState'

/**
 * Fetch token balance from chain
 * @param token
 */
export function useERC20TokenBalance(address: string) {
    const account = useAccount()
    const chainId = useChainId()
    const erc20Contract = useERC20TokenContract(address)
    return useAsyncRetry(async () => {
        if (!account || !address || !erc20Contract) return undefined
        return erc20Contract.methods.balanceOf(account).call()
    }, [account, chainId /* re-calc when switch the chain */, address, erc20Contract])
}
