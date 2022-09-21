import { useEffect, useState } from 'react'
import {
    PluginIDContextProvider,
    PluginWeb3ContextProvider,
    useChainIdValid,
    Web3Helper,
} from '@masknet/plugin-infra/web3'
import { CrossIsolationMessages } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { CardDialog } from './CardDialog/CardDialog.js'
import { Context } from './Context/index.js'

export interface DialogInspectorProps {}

export function DialogInspector(props: DialogInspectorProps) {
    const [open, setOpen] = useState(false)
    const [pluginID, setPluginID] = useState<NetworkPluginID>()
    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>()
    const [tokenId, setTokenId] = useState<string>()
    const [tokenAddress, setTokenAddress] = useState<string>()
    const chainIdValid = useChainIdValid(pluginID, chainId)

    useEffect(() => {
        if (!chainIdValid) setOpen(false)
        return CrossIsolationMessages.events.requestNFTCardDialog.on((ev) => {
            if (!ev.open) return
            setPluginID(ev.pluginID)
            setChainId(ev.chainId)
            setTokenAddress(ev.tokenAddress)
            setTokenId(ev.tokenId)
            setOpen(ev.open)
        })
    }, [chainIdValid])

    if (!chainId || !pluginID) return null
    if (!tokenId || !tokenAddress) return null

    return (
        <PluginIDContextProvider value={pluginID}>
            <PluginWeb3ContextProvider
                pluginID={pluginID}
                value={{
                    chainId,
                }}>
                <Context.Provider initialState={{ pluginID, chainId, tokenId, tokenAddress }}>
                    <CardDialog open={open} setOpen={setOpen} />
                </Context.Provider>
            </PluginWeb3ContextProvider>
        </PluginIDContextProvider>
    )
}
