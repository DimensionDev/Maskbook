import { useEffect, useState } from 'react'
import { PluginIDContextProvider, PluginWeb3ContextProvider, useChainIdValid } from '@masknet/plugin-infra/web3'
import { ChainId } from '@masknet/web3-shared-evm'
import { InjectedDialog } from '@masknet/shared'
import { MaskTabList, useTabs } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { TabContext } from '@mui/lab'
import { DialogContent, Tab } from '@mui/material'
import { NFTCardContent } from './NFTCardContent'
import { useStyles } from '../useStyles'
import { useNFTCardInfo } from './hooks/useNFTCardInfo'
import { useI18N } from '../../../utils'

export enum NFTCardDialogTabs {
    About = 'About',
    Offers = 'Offers',
    Activity = 'Activity',
}

export function NFTCardDialog() {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [tokenId, setTokenId] = useState('')
    const [tokenAddress, setTokenAddress] = useState('')
    const [chainId, setChainId] = useState(ChainId.Mainnet)
    const [pluginID, setPluginID] = useState(NetworkPluginID.PLUGIN_EVM)
    const chainIdValid = useChainIdValid(pluginID)
    const [open, setOpen] = useState(false)
    const { asset, orders, events, provider } = useNFTCardInfo(tokenAddress, tokenId)

    const [currentTab, onChange] = useTabs<NFTCardDialogTabs>(
        NFTCardDialogTabs.About,
        NFTCardDialogTabs.Offers,
        NFTCardDialogTabs.Activity,
    )

    useEffect(() => {
        if (!chainIdValid) setOpen(false)
        return CrossIsolationMessages.events.requestNFTCardDialog.on((ev) => {
            if (!ev.open) return
            if (ev.pluginID) setPluginID(ev.pluginID)
            if (ev.chainId) setChainId(ev.chainId)
            setTokenAddress(ev.address)
            setTokenId(ev.tokenId)
            setOpen(ev.open)
        })
    }, [chainIdValid])

    return (
        <PluginIDContextProvider value={pluginID}>
            <PluginWeb3ContextProvider
                pluginID={pluginID}
                value={{
                    chainId: chainId,
                }}>
                <TabContext value={currentTab}>
                    <InjectedDialog
                        open={open}
                        title={t('plugin_collectible_nft_detail')}
                        onClose={() => setOpen(false)}
                        classes={{ paper: classes.dialogRoot }}
                        titleTabs={
                            <MaskTabList variant="base" onChange={onChange} aria-label="NFTCard">
                                <Tab label="About" value={NFTCardDialogTabs.About} />
                                <Tab label="Offers" value={NFTCardDialogTabs.Offers} />
                                <Tab label="Activity" value={NFTCardDialogTabs.Activity} />
                            </MaskTabList>
                        }>
                        <DialogContent className={classes.dialogContent}>
                            <NFTCardContent
                                provider={provider}
                                events={events}
                                orders={orders}
                                asset={asset}
                                currentTab={currentTab}
                            />
                        </DialogContent>
                    </InjectedDialog>
                </TabContext>
            </PluginWeb3ContextProvider>
        </PluginIDContextProvider>
    )
}
