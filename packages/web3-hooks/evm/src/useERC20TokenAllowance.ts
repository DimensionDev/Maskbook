import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { Contract } from '@masknet/web3-providers'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useChainContext, useBeatRetry } from '@masknet/web3-hooks-base'

export function useERC20TokenAllowance(
    address?: string,
    spender?: string,
    options?: ConnectionOptions<NetworkPluginID.PLUGIN_EVM>,
): AsyncStateRetry<string> {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        account: options?.account,
        chainId: options?.chainId,
    })
    return useBeatRetry(
        async () => {
            if (!account || !address || !spender) return '0'
            return Contract.getERC20Contract(address, { chainId })?.methods.allowance(account, spender).call({
                from: account,
            })
        },
        30 * 1000,
        [account, chainId, spender],
    )
}
