import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useAccount } from '../useAccount.js'
import { useBeatRetry } from '../useBeat.js'
import { useChainId } from '../useChainId.js'
import { useERC20TokenContract } from './useERC20TokenContract.js'

export function useERC20TokenAllowance(
    address?: string,
    spender?: string,
    options?: Web3Helper.Web3ConnectionOptionsScope<void, NetworkPluginID.PLUGIN_EVM>,
): AsyncStateRetry<string> {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM, options?.account)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM, options?.chainId)
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
