import { useCallback } from 'react'
import { DialogContent, dialogClasses } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { InjectedDialog, WalletStatusBox } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(2),
        overflowX: 'hidden',
    },
    inVisible: {
        visibility: 'hidden',
    },
    dialog: {
        [`.${dialogClasses.paper}`]: {
            minHeight: 'unset !important',
        },
    },
}))

interface WalletStatusDialogProps {
    open: boolean
    onClose: () => void
    isHidden: boolean
    setHidden: (isHidden: boolean) => void
}

export function WalletStatusDialog({ open, onClose, isHidden = false, setHidden }: WalletStatusDialogProps) {
    const { classes } = useStyles()

    // #region remote controlled dialog logic
    const closeDialog = useCallback(() => {
        onClose()
        CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
            reason: 'timeline',
            open: false,
        })
    }, [onClose])
    // #endregion

    return (
        <InjectedDialog
            title={<Trans>Wallet Account</Trans>}
            open={open}
            onClose={closeDialog}
            maxWidth="sm"
            className={isHidden ? classes.inVisible : classes.dialog}>
            <DialogContent className={classes.content}>
                <WalletStatusBox
                    showPendingTransaction
                    closeDialog={() => {
                        setHidden(true)
                        onClose()
                    }}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
