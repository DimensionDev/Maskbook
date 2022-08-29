import { useChainIdValid } from '@masknet/plugin-infra/web3'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { MaskTabList, useTabs } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { TabContext } from '@mui/lab'
import { DialogContent, Tab } from '@mui/material'
import { useEffect, useState } from 'react'
import { NFTCardMessage } from '../messages'
import { NFTCardDialogUI } from './NFTCardDialogUI'
import { useStyles } from '../useStyles'
import { useNFTCardInfo } from './hooks/useNFTCardInfo'

export enum NFTCardDialogTabs {
    About = 'About',
    Offers = 'Offers',
    Activity = 'Activity',
}

export function NFTCardDialog() {
    const { classes } = useStyles()
    const [tokenId, setTokenId] = useState('')
    const [tokenAddress, setTokenAddress] = useState('')
    const chainIdValid = useChainIdValid(NetworkPluginID.PLUGIN_EVM)
    const { open: remoteOpen, closeDialog } = useRemoteControlledDialog(
        NFTCardMessage.events.nftCardDialogUpdated,
        (ev) => {
            if (!ev.open) return
            setTokenId(ev.tokenId)
            setTokenAddress(ev.address)
        },
    )
    const { asset, orders, events, rarity, provider, setProvider } = useNFTCardInfo(tokenAddress, tokenId)

    const [currentTab, onChange] = useTabs<NFTCardDialogTabs>(
        NFTCardDialogTabs.About,
        NFTCardDialogTabs.Offers,
        NFTCardDialogTabs.Activity,
    )

    useEffect(() => {
        if (!chainIdValid) closeDialog
    }, [chainIdValid, closeDialog])

    return (
        <TabContext value={currentTab}>
            <InjectedDialog
                open={remoteOpen}
                title="NFT Details"
                onClose={closeDialog}
                classes={{ paper: classes.dialogRoot }}
                titleTabs={
                    <MaskTabList variant="base" onChange={onChange} aria-label="NFTCard">
                        <Tab label="About" value={NFTCardDialogTabs.About} />
                        <Tab label="Offers" value={NFTCardDialogTabs.Offers} />
                        <Tab label="Activity" value={NFTCardDialogTabs.Activity} />
                    </MaskTabList>
                }>
                <DialogContent className={classes.dialogContent}>
                    <NFTCardDialogUI
                        provider={provider}
                        events={events}
                        orders={orders}
                        onChangeProvider={setProvider}
                        asset={asset}
                        currentTab={currentTab}
                    />
                </DialogContent>
            </InjectedDialog>
        </TabContext>
    )
}
