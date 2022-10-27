import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useBeatRetry } from '@masknet/web3-hooks-base'
import { useERC20TokenContract } from './useERC20TokenContract.js'

export function useERC20TokenAllowance(
    address?: string,
    spender?: string,
    options?: Web3Helper.Web3ConnectionOptionsScope<void, NetworkPluginID.PLUGIN_EVM>,
): AsyncStateRetry<string> {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        account: options?.account,
        chainId: options?.chainId,
    })
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
