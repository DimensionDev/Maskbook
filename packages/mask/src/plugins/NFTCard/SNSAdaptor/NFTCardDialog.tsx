import { useEffect } from 'react'
import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
import { NFTCardMessage } from '../messages'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: 800,
        height: 800,
    },
    content: {
        padding: theme.spacing(0, 0, 1, 0),
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

export interface NFTCardDialogProps {}

export function NFTCardDialog(props: NFTCardDialogProps) {
    const { classes } = useStyles()
    // #region remote controlled dialog logic
    const { open, closeDialog } = useRemoteControlledDialog(NFTCardMessage.events.nftCardDialogUpdated, (ev) => {
        if (!ev.open) return
        console.log('open', ev.address, ev.tokenId)
    })

    useEffect(() => {
        if (!open) return
    }, [open])

    return (
        <InjectedDialog className={classes.root} title="NFT Details" open={open} onClose={closeDialog}>
            <DialogContent className={classes.content}>222</DialogContent>
        </InjectedDialog>
    )
}
