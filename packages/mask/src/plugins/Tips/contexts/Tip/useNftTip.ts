import { useCallback } from 'react'
import { useERC721TokenTransferCallback } from '@masknet/plugin-infra/web3-evm'
import { useWeb3Connection, useChainId, useWeb3State } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { TipTuple } from './type'

export function useNftTip(recipient: string, tokenId: string | null, contractAddress?: string): TipTuple {
<<<<<<< HEAD
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const { Token } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [transferState, transferCallback] = useERC721TokenTransferCallback(contractAddress || '')

    const sendTip = useCallback(async () => {
        if (!tokenId || !contractAddress) return
        await transferCallback(tokenId, recipient)
        const tokenDetailed = await connection?.getNonFungibleToken(contractAddress ?? '', tokenId, {
            chainId,
        })
=======
    const [{ loading: isTransferring }, transferCallback] = useTokenTransferCallback(
        EthereumTokenType.ERC721,
        contractAddress || '',
    )
    const { value: contractDetailed } = useERC721ContractDetailed(contractAddress)
    const [, setTokenId, erc721TokenDetailedCallback] = useERC721TokenDetailedCallback(contractDetailed)

    useEffect(() => {
        if (tokenId) {
            setTokenId(tokenId)
        }
    }, [tokenId])

    const sendTip = useCallback(async () => {
        if (!tokenId || !contractAddress) return
        const hash = await transferCallback(tokenId, recipient)
        const tokenDetailed = await erc721TokenDetailedCallback()
>>>>>>> develop
        if (tokenDetailed) {
            await Token?.removeToken?.(tokenDetailed)
        }
<<<<<<< HEAD
    }, [tokenId, contractAddress, recipient, transferCallback])
=======
        return hash
    }, [tokenId, contractAddress, erc721TokenDetailedCallback, recipient, transferCallback])
>>>>>>> develop

    return [isTransferring, sendTip]
}
