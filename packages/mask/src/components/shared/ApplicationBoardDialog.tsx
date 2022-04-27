import { DialogContent } from '@mui/material'
import { useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { InjectedDialog } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ApplicationBoard } from './ApplicationBoard'
import { WalletMessages } from '../../plugins/Wallet/messages'

const useStyles = makeStyles()((theme) => {
    return {
        content: {
            padding: theme.spacing(2.5),
            height: 540,
            overflowX: 'hidden',
        },
    }
})

export function ApplicationBoardDialog() {
    const { classes } = useStyles()

    const { open, closeDialog: _closeDialog } = useRemoteControlledDialog(
        WalletMessages.events.ApplicationDialogUpdated,
    )

    const closeDialog = useCallback(() => {
        _closeDialog()
        CrossIsolationMessages.events.requestComposition.sendToLocal({
            reason: 'timeline',
            open: false,
        })
    }, [])

    return (
        <InjectedDialog open={open} maxWidth="sm">
            <DialogContent className={classes.content}>
                <ApplicationBoard closeDialog={closeDialog} />
            </DialogContent>
        </InjectedDialog>
    )
}
