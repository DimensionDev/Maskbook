import { useCallback } from 'react'
import { useERC721TokenTransferCallback } from '@masknet/plugin-infra/web3-evm'
import { useWeb3Connection, useChainId, useWeb3State } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { TipTuple } from './type'

export function useNftTip(recipient: string, tokenId: string | null, contractAddress?: string): TipTuple {
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const { Token } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [{ loading: isTransferring }, transferCallback] = useERC721TokenTransferCallback(contractAddress || '')

    const sendTip = useCallback(async () => {
        if (!tokenId || !contractAddress) return
        const hash = await transferCallback(tokenId, recipient)
        const tokenDetailed = await connection?.getNonFungibleToken(contractAddress ?? '', tokenId, {
            chainId,
        })
        if (tokenDetailed) {
            await Token?.removeToken?.(tokenDetailed)
        }
        return hash
    }, [tokenId, contractAddress, recipient, transferCallback])

    return [isTransferring, sendTip]
}
