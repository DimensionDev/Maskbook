import { EVMContract } from '@masknet/web3-providers'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useChainContext } from '@masknet/web3-hooks-base'
import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'

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
            const contract = EVMContract.getERC20Contract(address)
            return (
                (
                    await EVMContract.readContract(contract, 'allowance', [account as Address, spender as Address], {
                        chainId,
                        from: account,
                    })
                )?.toString() ?? '0'
            )
        },
        refetchInterval: 30 * 1000,
    })
}
