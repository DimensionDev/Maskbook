import { useCallback, useState } from 'react'
import { DialogContent, dialogClasses } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { WalletMessages } from '@masknet/plugin-wallet'
import { WalletStatusBox } from '../../../../components/shared/WalletStatusBox/index.js'
import { useI18N } from '../../../../utils/index.js'

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

export interface WalletStatusDialogProps {}

export function WalletStatusDialog(props: WalletStatusDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()

    const [isHidden, setIsHidden] = useState(false)

    // #region remote controlled dialog logic
    const { open, closeDialog: _closeDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
        (ev) => {
            if (ev.open) setIsHidden(false)
        },
    )

    const closeDialog = useCallback(() => {
        _closeDialog()
        CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
            reason: 'timeline',
            open: false,
        })
    }, [])
    // #endregion

    return (
        <InjectedDialog
            title={t('plugin_wallet_dialog_title')}
            open={open}
            onClose={closeDialog}
            maxWidth="sm"
            className={isHidden ? classes.inVisible : classes.dialog}>
            <DialogContent className={classes.content}>
                <WalletStatusBox
                    showPendingTransaction
                    closeDialog={() => {
                        setIsHidden(true)
                        _closeDialog()
                    }}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
