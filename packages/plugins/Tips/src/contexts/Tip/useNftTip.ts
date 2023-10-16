import { useAsyncFn } from 'react-use'
import { useChainContext, useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { NetworkPluginID } from '@masknet/shared-base'
import type { TipTuple } from './type.js'

export function useNftTip<T extends NetworkPluginID>(
    pluginID: T,
    recipient: string,
    contractAddress: string,
    tokenId?: string | null,
    options?: ConnectionOptions<T>,
): TipTuple {
    const { Token } = useWeb3State<'all'>(pluginID)
    const { account, chainId } = useChainContext()
    const Web3 = useWeb3Connection(pluginID, {
        account,
        ...options,
        overrides: {},
    })

    const [{ loading: isTransferring }, sendTip] = useAsyncFn(async () => {
        if (!contractAddress) return
        if (pluginID === NetworkPluginID.PLUGIN_EVM && !tokenId) return
        const txid = await Web3.transferNonFungibleToken(contractAddress, tokenId ?? '', recipient, '1')
        const tokenDetailed = await Web3.getNonFungibleToken(contractAddress, tokenId ?? '', undefined, {
            chainId,
            account,
        })
        if (tokenDetailed) {
            await Token?.removeToken?.(account, tokenDetailed)
        }
        return txid
    }, [account, tokenId, pluginID, contractAddress, recipient, Web3])

    return [isTransferring, sendTip]
}
