import { useEffect, useState } from 'react'
import { CrossIsolationMessages, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Web3ContextProvider, useChainIdValid, useNetworkContext } from '@masknet/web3-hooks-base'
import { CardDialog } from './CardDialog/CardDialog.js'
import { Context } from './Context/index.js'

export function DialogInspector() {
    const { pluginID: parentPluginID } = useNetworkContext()
    const [open, setOpen] = useState(false)
    const [pluginID, setPluginID] = useState<NetworkPluginID>()
    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>()
    const [tokenId, setTokenId] = useState<string>()
    const [tokenAddress, setTokenAddress] = useState<string>()
    const [ownerAddress, setOwnerAddress] = useState<string>()
    const [originType, setOriginType] = useState<string>()
    const chainIdValid = useChainIdValid(pluginID, chainId)

    if (open && !chainIdValid) setOpen(false)

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

    // Solana NFT has no token id.
    if (pluginID === NetworkPluginID.PLUGIN_SOLANA) {
        if (!tokenAddress) return null
    }

    if (pluginID === NetworkPluginID.PLUGIN_FLOW) {
        if (!ownerAddress || !tokenAddress || !tokenId) return null
    }

    return (
        <Web3ContextProvider network={pluginID} chainId={chainId}>
            <Context
                initialState={{
                    parentPluginID,
                    pluginID,
                    chainId,
                    tokenId: tokenId ?? '0',
                    tokenAddress: tokenAddress!,
                    ownerAddress,
                    origin: originType,
                }}>
                <CardDialog key={`${tokenAddress}.${tokenId}`} open={open} setOpen={setOpen} />
            </Context>
        </Web3ContextProvider>
    )
}
