import { useAsyncRetry } from 'react-use'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'
import { useBlockNumber } from './useBlockNumber'

export function useERC20TokenAllowance(address: string, spender?: string) {
    const account = useAccount()
    const chainId = useChainId()
    const blockNumber = useBlockNumber()
    const erc20Contract = useERC20TokenContract(address)
    return useAsyncRetry(async () => {
        if (!account || !spender || !erc20Contract) return '0'
        return erc20Contract.methods.allowance(account, spender).call({
            from: account,
        })
    }, [account, blockNumber, chainId, spender, erc20Contract])
}
