import { useAsyncFn } from 'react-use'
import { useAccount, useWeb3State } from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID, rightShift } from '@masknet/web3-shared-base'

export function useTransferFungibleToken<T extends NetworkPluginID>(
    pluginId: T,
    recipient: string,
    token: Web3Helper.FungibleTokenScope<'all'> | null,
    amount: string,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    const account = useAccount(pluginId)
    const { Connection } = useWeb3State<'all'>(pluginId)

    const [{ loading }, transferCallback] = useAsyncFn(async () => {
        const connection = await Connection?.getConnection?.()
        if (!token?.address || !connection) return
        return connection.transferFungibleToken(
            token?.address,
            recipient,
            rightShift(amount, token.decimals).toFixed(),
            '',
            {
                account,
                ...options,
            },
        )
    }, [account, amount, recipient, token?.address, token?.decimals, JSON.stringify(options)])

    return [loading, transferCallback] as const
}
