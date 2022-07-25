import { useChainIdValid, useNonFungibleAsset } from '@masknet/plugin-infra/web3'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { MaskTabList, useTabs } from '@masknet/theme'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { TabContext } from '@mui/lab'
import { DialogContent, Tab } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { PluginNFTCardMessages } from '../message'
import { NFTCardDialogUI } from './NFTCardDialogUI'
import { useStyles } from './useStyles'

export enum NFTCardDialogTabs {
    About = 'About',
    Offers = 'Offers',
    Activity = 'Activity',
}

export function NFTCardDialog() {
    const { classes } = useStyles()
    const [open, setOpen] = useState(false)
    const chainIdValid = useChainIdValid(NetworkPluginID.PLUGIN_EVM)
    const { open: remoteOpen, closeDialog } = useRemoteControlledDialog(
        PluginNFTCardMessages.nftDialogUpdated,
        (ev) => {
            console.log(ev, 'params')
        },
    )
    const asset = useNonFungibleAsset(NetworkPluginID.PLUGIN_EVM, '0xFD43D1dA000558473822302e1d44D81dA2e4cC0d', '5', {
        sourceType: SourceType.OpenSea,
        chainId: ChainId.Mainnet,
    })
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
                    <NFTCardDialogUI asset={asset} currentTab={currentTab} />
                </DialogContent>
            </InjectedDialog>
        </TabContext>
    )
}
