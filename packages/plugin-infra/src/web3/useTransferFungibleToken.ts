import { useAsyncRetry } from 'react-use'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID, rightShift } from '@masknet/web3-shared-base'
import { useAccount } from './useAccount.js'
import { useWeb3State } from './useWeb3State.js'

export function useTransferFungibleToken<T extends NetworkPluginID>(
    pluginId: T,
    recipient: string,
    token: Web3Helper.FungibleTokenScope<'all'> | null,
    amount: string,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    const account = useAccount(pluginId)
    const { Connection } = useWeb3State<'all'>(pluginId)

    return useAsyncRetry(async () => {
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
}
