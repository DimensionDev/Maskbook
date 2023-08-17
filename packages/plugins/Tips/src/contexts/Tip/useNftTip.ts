import { useAsyncFn } from 'react-use'
import { useChainContext, useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { NetworkPluginID } from '@masknet/shared-base'
import type { TipTuple } from './type.js'
import { useCustomSnackbar } from '@masknet/theme'
import { useI18N } from '../../locales/i18n_generated.js'

export function useNftTip<T extends NetworkPluginID>(
    pluginID: T,
    recipient: string,
    contractAddress: string,
    tokenId?: string | null,
    options?: ConnectionOptions<T>,
): TipTuple {
    const t = useI18N()
    const { Token } = useWeb3State<'all'>(pluginID)
    const { account, chainId } = useChainContext()
    const Web3 = useWeb3Connection(pluginID, {
        account,
        ...options,
        overrides: {},
    })
    const { showSnackbar } = useCustomSnackbar()
    const [{ loading: isTransferring }, sendTip] = useAsyncFn(async () => {
        try {
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
        } catch {
            showSnackbar(t.failed_to_transfer_nft(), { variant: 'error' })
            return
        }
    }, [account, tokenId, pluginID, contractAddress, recipient, Web3])

    return [isTransferring, sendTip]
}
