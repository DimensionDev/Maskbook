import { createContainer } from 'unstated-next'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { Web3Helper, useFungibleAssets, useAccount, useChainId } from '@masknet/plugin-infra/web3'

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
