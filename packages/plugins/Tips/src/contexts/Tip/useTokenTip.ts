import { useAsyncFn } from 'react-use'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'
import { rightShift } from '@masknet/web3-shared-base'
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import type { TipTuple } from './type.js'

export function useTokenTip<T extends NetworkPluginID>(
    pluginID: T,
    recipient: string,
    token: Web3Helper.FungibleTokenAll | null,
    amount: string,
    options?: ConnectionOptions<T>,
): TipTuple {
    const { account } = useChainContext()
    const Web3 = useWeb3Connection(pluginID, {
        account,
        ...options,
    })
    const [{ loading: isTransferring }, sendTip] = useAsyncFn(async () => {
        if (!token?.address) return
        const totalAmount = rightShift(amount, token.decimals).toFixed()
        return Web3.transferFungibleToken(token.address, recipient, totalAmount, '')
    }, [account, token?.address, token?.decimals, amount, Web3])

    return [isTransferring, sendTip]
}
