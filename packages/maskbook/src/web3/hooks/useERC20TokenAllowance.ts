import { useAsync } from 'react-use'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { useAccount } from './useAccount'
import { useChainId } from './useChainState'

export function useERC20TokenAllowance(address: string, spender?: string) {
    const account = useAccount()
    const chainId = useChainId()
    const erc20Contract = useERC20TokenContract(address)
    return useAsync(async () => {
        if (!account || !spender || !erc20Contract) return '0'
        return erc20Contract.methods.allowance(account, spender).call()
    }, [account, chainId /* re-calc when switch the chain */, spender, erc20Contract])
}
