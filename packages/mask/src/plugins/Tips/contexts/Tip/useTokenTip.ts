import { useAsyncFn } from 'react-use'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'
import { FungibleToken, rightShift } from '@masknet/web3-shared-base'
import { useChainContext, useWeb3State } from '@masknet/web3-hooks-base'
import type { TipTuple } from './type.js'

export function useTokenTip<T extends NetworkPluginID>(
    pluginID: T,
    recipient: string,
    token: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | null,
    amount: string,
    options?: Web3Helper.Web3ConnectionOptions<T>,
): TipTuple {
    const { Connection } = useWeb3State<'all'>(pluginID)
    const { account } = useChainContext()
    const [{ loading: isTransferring }, sendTip] = useAsyncFn(async () => {
        const connection = await Connection?.getConnection?.()
        if (!token?.address || !connection) return
        const connectionOptions = {
            account,
            ...options,
        }
        const totalAmount = rightShift(amount, token.decimals).toFixed()
        return connection.transferFungibleToken(token?.address, recipient, totalAmount, '', connectionOptions)
    }, [JSON.stringify(options), account, token?.address, token?.decimals, amount])

    return [isTransferring, sendTip]
}
