import { useNonFungibleAsset } from '@masknet/plugin-infra/web3'
import { InjectedDialog } from '@masknet/shared'
import { MaskTabList, useTabs } from '@masknet/theme'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { TabContext } from '@mui/lab'
import { DialogContent, Tab } from '@mui/material'
import { useCallback, useState } from 'react'
import { NFTCardDialogUI } from './NFTCardDialogUI'
import { useStyles } from './useStyles'

export enum NFTCardDialogTabs {
    About = 'About',
    Offers = 'Offers',
    Activity = 'Activity',
}

export function NFTCardDialog() {
    const { classes } = useStyles()
    const [open, setOpen] = useState(true)

    const onClose = useCallback(() => {
        setOpen(false)
    }, [])
    const [currentTab, onChange] = useTabs<NFTCardDialogTabs>(
        NFTCardDialogTabs.About,
        NFTCardDialogTabs.Offers,
        NFTCardDialogTabs.Activity,
    )

    const asset = useNonFungibleAsset(NetworkPluginID.PLUGIN_EVM, '0xFD43D1dA000558473822302e1d44D81dA2e4cC0d', '5', {
        sourceType: SourceType.OpenSea,
        chainId: ChainId.Mainnet,
    })
    return (
        <TabContext value={currentTab}>
            <InjectedDialog
                open={open}
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
