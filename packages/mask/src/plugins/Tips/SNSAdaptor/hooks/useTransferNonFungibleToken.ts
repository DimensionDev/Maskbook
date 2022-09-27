import { useAsyncFn } from 'react-use'
import { useAccount, useChainId, useWeb3State } from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'

export function useTransferNonFungibleToken<T extends NetworkPluginID>(
    pluginID: T,
    recipient: string,
    tokenId: string | null,
    tokenAddress?: string,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    const chainId = useChainId(pluginID)
    const account = useAccount(pluginID)
    const { Token, Connection } = useWeb3State<'all'>(pluginID)

    const [{ loading }, transferCallback] = useAsyncFn(async () => {
        const connection = await Connection?.getConnection?.()

        if (!tokenId || !connection) return

        const hash = await connection.transferNonFungibleToken(tokenAddress, recipient, tokenId, '1', undefined, {
            account,
            ...options,
            overrides: {
                from: account,
            },
        })
        const tokenDetailed = await connection?.getNonFungibleToken(tokenAddress ?? '', tokenId, undefined, {
            chainId,
            account,
        })
        if (tokenDetailed) {
            await Token?.removeToken?.(account, tokenDetailed)
        }
        return hash
    }, [account, tokenId, pluginID, Connection, tokenAddress, recipient, JSON.stringify(options)])

    return [loading, transferCallback] as const
}
