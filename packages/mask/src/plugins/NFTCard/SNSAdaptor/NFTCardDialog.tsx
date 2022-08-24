import { useEffect } from 'react'
import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
import { NFTCardMessage } from '../messages'

const useStyles = makeStyles()((theme) => ({
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
    const { open, closeDialog } = useRemoteControlledDialog(NFTCardMessage.events.NFTCardDialogUpdated, (ev) => {
        if (!ev.open) return
    })

    useEffect(() => {
        if (!open) return
    }, [open])

    return (
        <InjectedDialog title="222" open={open} onClose={closeDialog}>
            <DialogContent className={classes.content}>222</DialogContent>
        </InjectedDialog>
    )
}
