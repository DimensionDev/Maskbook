import { EVMContract } from '@masknet/web3-providers'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useChainContext } from '@masknet/web3-hooks-base'
import { useQuery } from '@tanstack/react-query'

export function useERC20TokenAllowance(
    address?: string,
    spender?: string,
    options?: ConnectionOptions<NetworkPluginID.PLUGIN_EVM>,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        account: options?.account,
        chainId: options?.chainId,
    })

    return useQuery({
        queryKey: ['erc20-allowance', address, account, spender, chainId],
        queryFn: async () => {
            if (!account || !address || !spender) return '0'
            return EVMContract.getERC20Contract(address, { chainId })?.methods.allowance(account, spender).call({
                from: account,
            })
        },
        refetchInterval: 30 * 1000,
    })
}
