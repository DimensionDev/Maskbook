import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'
import { DOUBLE_BLOCK_DELAY, useBeatRetry } from '@masknet/web3-shared-base'

export function useERC20TokenAllowance(address?: string, spender?: string) {
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
        DOUBLE_BLOCK_DELAY,
        [account, chainId, spender, erc20Contract],
    )
}
