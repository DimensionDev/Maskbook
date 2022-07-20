import { InjectedDialog } from '@masknet/shared'
import { DialogStackingProvider, MaskTabList, useTabs } from '@masknet/theme'
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
    return (
        <DialogStackingProvider>
            <TabContext value={currentTab}>
                <InjectedDialog
                    open={open}
                    title="NFT Details"
                    onClose={onClose}
                    classes={{ paper: classes.dialogRoot }}
                    titleTabs={
                        <MaskTabList variant="base" onChange={onChange} aria-label="Savings">
                            <Tab label="About" value="about" />
                            <Tab label="Offers" value="offers" />
                            <Tab label="Activity" value="activity" />
                        </MaskTabList>
                    }>
                    <DialogContent className={classes.dialogContent}>
                        <NFTCardDialogUI currentTab={currentTab} />
                    </DialogContent>
                </InjectedDialog>
            </TabContext>
        </DialogStackingProvider>
    )
}
