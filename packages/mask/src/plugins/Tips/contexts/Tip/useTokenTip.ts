import { useAccount, useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
import type { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncFn } from 'react-use'
import type { TipTuple } from './type'

export function useTokenTip<T extends NetworkPluginID>(
    pluginId: T,
    recipient: string,
    token: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | null,
    amount: string,
    options?: Web3Helper.Web3ConnectionOptions<T>,
): TipTuple {
    const { Connection } = useWeb3State<'all'>(pluginId)
    const account = useAccount(pluginId)
    const connectionOptions = {
        account,
        ...options,
    }
    const [{ loading: isTransferring }, sendTip] = useAsyncFn(async () => {
        const connection = await Connection?.getConnection?.()
        debugger
        if (!token?.address || !connection) return
        debugger
        return connection.transferFungibleToken(token?.address, recipient, amount, '', connectionOptions)
    }, [JSON.stringify(connectionOptions), token?.address])

    return [isTransferring, sendTip]
}
