import { useAccount, useChainId, useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { TipTuple } from './type.js'
import { useAsyncFn } from 'react-use'

export function useNftTip<T extends NetworkPluginID>(
    pluginId: T,
    recipient: string,
    tokenId: string | null,
    contractAddress?: string,
    options?: Web3Helper.Web3ConnectionOptions<T>,
): TipTuple {
    const { Token, Connection } = useWeb3State<'all'>(pluginId)
    const chainId = useChainId()

    const account = useAccount(pluginId)
    const connectionOptions = {
        account,
        ...options,
        overrides: {
            from: account,
        },
    }
    const [{ loading: isTransferring }, sendTip] = useAsyncFn(async () => {
        const connection = await Connection?.getConnection?.()
        if (!tokenId || !connection) return
        if (pluginId === NetworkPluginID.PLUGIN_EVM && !contractAddress) return
        const txid = await connection.transferNonFungibleToken(
            contractAddress,
            recipient,
            tokenId,
            '1',
            undefined,
            connectionOptions,
        )
        const tokenDetailed = await connection?.getNonFungibleToken(contractAddress ?? '', tokenId, undefined, {
            chainId,
            account,
        })
        if (tokenDetailed) {
            await Token?.removeToken?.(account, tokenDetailed)
        }
        return txid
    }, [account, tokenId, pluginId, Connection, contractAddress, recipient, JSON.stringify(connectionOptions)])

    return [isTransferring, sendTip]
}
