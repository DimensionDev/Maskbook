import { useERC721TokenTransferCallback } from '@masknet/plugin-infra/web3-evm'
import { useNonFungibleTokenContract } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useERC721TokenDetailedCallback } from '@masknet/web3-shared-evm'
import { useCallback, useEffect } from 'react'
import { WalletRPC } from '../../../Wallet/messages'
import type { TipTuple } from './type'

export function useNftTip(recipient: string, tokenId: string | null, contractAddress?: string): TipTuple {
    const [transferState, transferCallback] = useERC721TokenTransferCallback(contractAddress || '')
    const { value: contractDetailed } = useNonFungibleTokenContract(NetworkPluginID.PLUGIN_EVM, contractAddress)
    const [, setTokenId, erc721TokenDetailedCallback] = useERC721TokenDetailedCallback(contractDetailed)

    useEffect(() => {
        if (tokenId) {
            setTokenId(tokenId)
        }
    }, [tokenId])

    const sendTip = useCallback(async () => {
        if (!tokenId || !contractAddress) return
        await transferCallback(tokenId, recipient)
        const tokenDetailed = await erc721TokenDetailedCallback()
        if (tokenDetailed) {
            await WalletRPC.removeToken(tokenDetailed)
        }
    }, [tokenId, contractAddress, erc721TokenDetailedCallback, recipient, transferCallback])

    return [transferState, sendTip]
}
