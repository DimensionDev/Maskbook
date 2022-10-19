import { useAsyncFn } from 'react-use'
import { useAccount, useChainId, useWeb3State } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID } from '@masknet/shared-base'
import type { TipTuple } from './type.js'

export function useNftTip<T extends NetworkPluginID>(
    pluginID: T,
    recipient: string,
    contractAddress: string,
    tokenId?: string | null,
    options?: Web3Helper.Web3ConnectionOptions<T>,
): TipTuple {
    const { Token, Connection } = useWeb3State<'all'>(pluginID)
    const chainId = useChainId()

    const account = useAccount(pluginID)
    const connectionOptions = {
        account,
        ...options,
        overrides: {
            from: account,
        },
    }
    const [{ loading: isTransferring }, sendTip] = useAsyncFn(async () => {
        const connection = await Connection?.getConnection?.()
        if (!connection || !contractAddress) return
        if (pluginID === NetworkPluginID.PLUGIN_EVM && !tokenId) return
        const txid = await connection.transferNonFungibleToken(
            contractAddress,
            tokenId ?? '',
            recipient,
            '1',
            undefined,
            connectionOptions,
        )
        const tokenDetailed = await connection?.getNonFungibleToken(contractAddress, tokenId ?? '', undefined, {
            chainId,
            account,
        })
        if (tokenDetailed) {
            await Token?.removeToken?.(account, tokenDetailed)
        }
        return txid
    }, [account, tokenId, pluginID, Connection, contractAddress, recipient, JSON.stringify(connectionOptions)])

    return [isTransferring, sendTip]
}
