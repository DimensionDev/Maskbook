import { useCallback, useState } from 'react'
import { Button, DialogContent, DialogActions, makeStyles, TextField } from '@material-ui/core'
import type { Wallet } from '@masknet/web3-shared'
import { WalletMessages, WalletRPC } from '../messages'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useSnackbarCallback } from '../../../extension/options-page/DashboardDialogs/Base'

const useStyles = makeStyles((theme) => ({
    content: {
        padding: theme.spacing(2, 4, 3),
    },
    dialogActions: {
        alignItems: 'center',
        padding: theme.spacing(3, 5),
    },
    actionButton: {},
}))

export function WalletRenameWalletDialog() {
    const { t } = useI18N()
    const classes = useStyles()
    const [name, setName] = useState('')
    const [wallet, setWallet] = useState<Wallet | null>(null)
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
        <InjectedDialog title={t('wallet_rename')} open={open} onClose={handleClose} maxWidth="xs">
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
                <Button
                    className={classes.actionButton}
                    variant="contained"
                    onClick={renameWallet}
                    disabled={!name}
                    fullWidth>
                    Confirm
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
