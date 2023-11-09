import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import { rightShift } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useAccount } from './useAccount.js'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useTransferFungibleToken<T extends NetworkPluginID>(
    pluginID: T,
    recipient: string,
    token: Web3Helper.FungibleTokenAll | null,
    amount: string,
    options?: ConnectionOptions<T>,
) {
    const account = useAccount(pluginID)
    const Web3 = useWeb3Connection(pluginID, {
        account,
        ...options,
    } as ConnectionOptions<T>)

    return useAsyncRetry(async () => {
        if (!token?.address) return
        return Web3.transferFungibleToken(token.address, recipient, rightShift(amount, token.decimals).toFixed(), '')
    }, [amount, recipient, token?.address, token?.decimals, Web3])
}
