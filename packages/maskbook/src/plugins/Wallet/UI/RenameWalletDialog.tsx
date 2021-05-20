import { useCallback, useState } from 'react'
import { Button, DialogContent, DialogActions, makeStyles, TextField } from '@material-ui/core'
import { WalletMessages, WalletRPC } from '../messages'
import type { WalletRecord } from '../database/types'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useSnackbarCallback } from '../../../extension/options-page/DashboardDialogs/Base'

const useStyles = makeStyles((theme) => ({
    content: {
        padding: theme.spacing(2, 4, 3),
    },
    dialogActions: {
        alignItems: 'center',
        padding: theme.spacing(3, 5),
    },
    actionButton: {
        backgroundColor: '#1C68F3',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#1854c4',
        },
        '&:disabled': {
            color: '#ffffff',
            backgroundColor: '#1C68F3',
            opacity: 0.5,
        },
    },
}))

export function WalletRenameWalletDialog() {
    const { t } = useI18N()
    const classes = useStyles()
    const [name, setName] = useState('')
    const [wallet, setWallet] = useState<WalletRecord | null>(null)
    const { open, setDialog } = useRemoteControlledDialog(WalletMessages.events.walletRenameDialogUpdated)
    WalletMessages.events.walletRenameDialogUpdated.on((data) => {
        if (data.open) {
            setName(data.wallet?.name ?? '')
            setWallet(data.wallet)
        }
    })
    const handleClose = useCallback(() => {
        setDialog({
            open: false,
            wallet: null,
        })
    }, [])
    const renameWallet = useSnackbarCallback(
        () => {
            if (!wallet?.address) {
                throw new Error('Not select wallet yet.')
            }
            return WalletRPC.renameWallet(wallet.address, name)
        },
        [wallet?.address],
        handleClose,
    )

    return (
        <InjectedDialog title={t('wallet_rename')} open={open} onClose={handleClose} DialogProps={{ maxWidth: 'xs' }}>
            <DialogContent className={classes.content}>
                <TextField
                    label={t('wallet_rename')}
                    fullWidth
                    autoFocus
                    inputProps={{ maxLength: 12 }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('plugin_wallet_name_placeholder')}
                    onKeyPress={(e) => e.key === 'Enter' && renameWallet()}
                />
            </DialogContent>
            <DialogActions className={classes.dialogActions}>
                <Button fullWidth color="inherit" variant="outlined" onClick={handleClose}>
                    Cancel
                </Button>
                <Button fullWidth className={classes.actionButton} onClick={renameWallet} disabled={!name}>
                    Confirm
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
