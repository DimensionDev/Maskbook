import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { useAccount } from '../useAccount'
import { useBeatRetry } from '../useBeat'
import { useChainId } from '../useChainId'
import { useERC20TokenContract } from './useERC20TokenContract'

export function useERC20TokenAllowance(address?: string, spender?: string): AsyncStateRetry<string> {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const erc20Contract = useERC20TokenContract(chainId, address)
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
