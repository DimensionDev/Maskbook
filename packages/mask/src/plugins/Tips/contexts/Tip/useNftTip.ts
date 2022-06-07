import { useCallback } from 'react'
import { useERC721TokenTransferCallback } from '@masknet/plugin-infra/web3-evm'
import { useChainId, useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { TipTuple } from './type'

export function useNftTip<T extends NetworkPluginID>(
    pluginId: T,
    recipient: string,
    tokenId: string | null,
    contractAddress?: string,
    options?: Web3Helper.Web3ConnectionOptions<T>,
): TipTuple {
    const { Token, Connection } = useWeb3State<'all'>(pluginId)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [{ loading: isTransferring }, transferCallback] = useERC721TokenTransferCallback(contractAddress || '')

    const sendTip = useCallback(async () => {
        const connection = await Connection?.getConnection?.()
        if (!tokenId || !connection) return
        if (pluginId === NetworkPluginID.PLUGIN_EVM && !contractAddress) return
        const txid = connection.transferNonFungibleToken(contractAddress, recipient, tokenId, '1', options)
        const tokenDetailed = await connection?.getNonFungibleToken(contractAddress ?? '', tokenId, {
            chainId,
        })
        if (tokenDetailed) {
            await Token?.removeToken?.(tokenDetailed)
        }
        return txid
    }, [tokenId, pluginId, contractAddress, recipient, transferCallback])

    return [isTransferring, sendTip]
}
