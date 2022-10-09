import { useEffect, useState } from 'react'
import { CrossIsolationMessages, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    PluginIDContextProvider,
    PluginWeb3ContextProvider,
    useChainIdValid,
    useCurrentWeb3NetworkPluginID,
} from '@masknet/web3-hooks-base'
import { CardDialog } from './CardDialog/CardDialog.js'
import { Context } from './Context/index.js'

export interface DialogInspectorProps {}

export function DialogInspector(props: DialogInspectorProps) {
    const parentPluginID = useCurrentWeb3NetworkPluginID()
    const [open, setOpen] = useState(false)
    const [pluginID, setPluginID] = useState<NetworkPluginID>()
    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>()
    const [tokenId, setTokenId] = useState<string>()
    const [tokenAddress, setTokenAddress] = useState<string>()
    const [ownerAddress, setOwnerAddress] = useState<string>()
    const [originType, setOriginType] = useState<string>()
    const chainIdValid = useChainIdValid(pluginID, chainId)

    useEffect(() => {
        if (!chainIdValid) setOpen(false)
    }, [chainIdValid])

    useEffect(
        () =>
            CrossIsolationMessages.events.nonFungibleTokenDialogEvent.on((ev) => {
                if (!ev.open) return
                setPluginID(ev.pluginID)
                setChainId(ev.chainId)
                setTokenId(ev.tokenId)
                setTokenAddress(ev.tokenAddress)
                setOwnerAddress(ev.ownerAddress)
                setOriginType(ev.origin ?? 'unknown')
                setOpen(ev.open)
            }),
        [],
    )

    if (!chainId || !pluginID) return null

    if (pluginID === NetworkPluginID.PLUGIN_EVM) {
        if (!tokenAddress || !tokenId) return null
    }

    if (pluginID === NetworkPluginID.PLUGIN_SOLANA) {
        if (!tokenId) return null
    }

    if (pluginID === NetworkPluginID.PLUGIN_FLOW) {
        if (!ownerAddress || !tokenAddress || !tokenId) return null
    }

    return (
        <PluginIDContextProvider value={pluginID}>
            <PluginWeb3ContextProvider
                pluginID={pluginID}
                value={{
                    chainId,
                }}>
                <Context.Provider
                    initialState={{
                        parentPluginID,
                        pluginID,
                        chainId,
                        tokenId: tokenId!,
                        tokenAddress: tokenAddress!,
                        ownerAddress,
                        origin: originType,
                    }}>
                    <CardDialog open={open} setOpen={setOpen} />
                </Context.Provider>
            </PluginWeb3ContextProvider>
        </PluginIDContextProvider>
    )
}
