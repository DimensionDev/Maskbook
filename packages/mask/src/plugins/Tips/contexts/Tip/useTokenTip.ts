import { useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
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
    const [{ loading: isTransferring }, sendTip] = useAsyncFn(async () => {
        const connection = await Connection?.getConnection?.()
        if (!token?.address || !connection) return
        return connection.transferFungibleToken(token?.address, recipient, amount, '', options)
    }, [JSON.stringify(options)])

    return [isTransferring, sendTip]
}
