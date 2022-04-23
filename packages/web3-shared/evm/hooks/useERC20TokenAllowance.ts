import { useBeatRetry } from '@masknet/web3-shared-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'

export function useERC20TokenAllowance(address?: string, spender?: string): AsyncStateRetry<string> {
    const account = useAccount()
    const chainId = useChainId()
    const erc20Contract = useERC20TokenContract(address)
    return useBeatRetry(
        async () => {
            if (!account || !spender || !erc20Contract) return '0'
            return erc20Contract.methods.allowance(account, spender).call({
                from: account,
            })
        },
        30 * 1000,
        [account, chainId, spender, erc20Contract],
    )
}
