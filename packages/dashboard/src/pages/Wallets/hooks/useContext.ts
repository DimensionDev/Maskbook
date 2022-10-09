import { createContainer } from 'unstated-next'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useFungibleAssets, useAccount, useChainId } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'

function useContext(initialState?: { account?: string; chainId?: Web3Helper.ChainIdAll; pluginID?: NetworkPluginID }) {
    const account = useAccount(initialState?.pluginID, initialState?.account)
    const chainId = useChainId(initialState?.pluginID, initialState?.chainId)
    const fungibleAssets = useFungibleAssets<'all'>(initialState?.pluginID, undefined, {
        account,
        chainId,
    })

    return {
        account,
        chainId,
        fungibleAssets,
    }
}

export const Context = createContainer(useContext)
