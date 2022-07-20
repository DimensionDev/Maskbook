import { InjectedDialog } from '@masknet/shared'
import { DialogStackingProvider, makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { DialogContent, Tab } from '@mui/material'
import { useCallback, useState } from 'react'
import { NFTCardDialogUI } from './NFTCardDialogUI'

const useStyles = makeStyles()({
    dialogRoot: {
        minWidth: 400,
        width: 600,
        boxShadow: 'none',
        backgroundImage: 'none',
        maxWidth: 'none',
    },
    hideDialogRoot: {
        visibility: 'hidden',
    },
    dialogContent: {
        padding: '20px 24px',
    },
})

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
                    title="NFT Card"
                    onClose={onClose}
                    classes={{ paper: classes.dialogRoot }}
                    titleTabs={
                        <MaskTabList variant="base" onChange={onChange} aria-label="Savings">
                            <Tab label="About" value="about" />
                            <Tab label="Offers" value="offers" />
                            <Tab label="Offers" value="offers" />
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
