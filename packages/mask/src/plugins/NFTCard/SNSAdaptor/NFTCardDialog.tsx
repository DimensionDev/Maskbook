import { useChainIdValid } from '@masknet/plugin-infra/web3'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { MaskTabList, useTabs } from '@masknet/theme'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'
import { TabContext } from '@mui/lab'
import { DialogContent, Tab } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { NFTCardMessage } from '../messages'
import { NFTCardDialogUI } from './NFTCardDialogUI'
import { useStyles } from '../useStyles'
import { NFTCardState } from './hooks/useNFTCardState'

export enum NFTCardDialogTabs {
    About = 'About',
    Offers = 'Offers',
    Activity = 'Activity',
}

export function NFTCardDialog() {
    const { classes } = useStyles()
    const [open, setOpen] = useState(false)
    const [tokenId, setTokenId] = useState('')
    const [tokenAddress, setTokenAddress] = useState('')
    const [sourceType, setSourceType] = useState(SourceType.Gem)
    const chainIdValid = useChainIdValid(NetworkPluginID.PLUGIN_EVM)
    const { open: remoteOpen, closeDialog } = useRemoteControlledDialog(
        NFTCardMessage.events.nftCardDialogUpdated,
        (ev) => {
            const { tokenId, address, open } = ev
            setTokenId(tokenId)
            setTokenAddress(address)
            if (open) {
                setOpen(true)
            }
        },
    )
    const { asset, orders, events, rarity } = NFTCardState.useContainer()

    console.log(asset, 'asset')
    const onClose = useCallback(() => {
        setOpen(false)
    }, [])
    const [currentTab, onChange] = useTabs<NFTCardDialogTabs>(
        NFTCardDialogTabs.About,
        NFTCardDialogTabs.Offers,
        NFTCardDialogTabs.Activity,
    )

    useEffect(() => {
        if (!chainIdValid) closeDialog()
    }, [chainIdValid, closeDialog])
    if (!asset.value) return null
    return (
        <TabContext value={currentTab}>
            <InjectedDialog
                open={open || remoteOpen}
                title="NFT Details"
                onClose={onClose}
                classes={{ paper: classes.dialogRoot }}
                titleTabs={
                    <MaskTabList variant="base" onChange={onChange} aria-label="Savings">
                        <Tab label="About" value={NFTCardDialogTabs.About} />
                        <Tab label="Offers" value={NFTCardDialogTabs.Offers} />
                        <Tab label="Activity" value={NFTCardDialogTabs.Activity} />
                    </MaskTabList>
                }>
                <DialogContent className={classes.dialogContent}>
                    <NFTCardDialogUI
                        provider={sourceType}
                        onChangeProvider={setSourceType}
                        asset={asset.value}
                        currentTab={currentTab}
                    />
                </DialogContent>
            </InjectedDialog>
        </TabContext>
    )
}
