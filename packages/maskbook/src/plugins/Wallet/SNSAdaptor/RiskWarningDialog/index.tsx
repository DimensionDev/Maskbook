import { DialogActions, DialogContent, makeStyles, Typography, Avatar, Paper } from '@material-ui/core'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useI18N } from '../../../../utils'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { MaskColorVar, useSnackbar } from '@masknet/theme'
import { useCallback, useState } from 'react'
import { WalletMessages } from '../../messages'
import { useRemoteControlledDialog } from '@masknet/shared'
import type { Wallet } from '@masknet/web3-shared'
import classnames from 'classnames'

const useStyles = makeStyles((theme) => ({
    paper: {
        paddingTop: theme.spacing(2),
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        color: 'rgb(255, 95, 95)',
    },
    buttons: {
        padding: theme.spacing(3),
    },
    button: {
        borderRadius: 9999,
    },
    cancel: {
        backgroundColor: MaskColorVar.normalBackground,
        color: 'rgba(28, 104, 243, 1)',
    },
    title: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
    icon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 64,
        height: 64,
        backgroundColor: 'rgba(255, 95, 95, 0.2)',
    },
    wallet: {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(23, 25, 29, 1)' : 'rgba(247, 249, 250, 1)',
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        borderRadius: theme.spacing(1),
        '&> :first-child': {
            paddingBottom: theme.spacing(1),
        },
    },
}))

export function WalletRiskWarningDialog() {
    const { t } = useI18N()
    const classes = useStyles()
    const [wallet, setWallet] = useState<Wallet | undefined>(undefined)
    const { enqueueSnackbar } = useSnackbar()
    const { open, setDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletRiskWarningDialogUpdated,
        (ev) => {
            if (ev.open) {
                setWallet(ev.wallet)
            }
        },
    )

    const onClose = useCallback(() => {
        setDialog({ open: false, type: 'cancel' })
    }, [setDialog])

    const onClick = useCallback(() => {
        if (!wallet?.address) {
            enqueueSnackbar(t('wallet_risk_warning_no_select_wallet'), {
                variant: 'error',
                preventDuplicate: true,
            })
            return
        }
        setDialog({ open: false, type: 'confirm' })
    }, [enqueueSnackbar, wallet?.address, setDialog])

    return (
        <InjectedDialog title={t('wallet_risk_warning_dialog_title')} open={open} onClose={onClose}>
            <DialogContent>
                <Paper className={classes.paper} elevation={0}>
                    <div className={classes.icon}>
                        <Avatar className={classes.avatar}>
                            <PriorityHighIcon style={{ fontSize: 58, color: 'rgba(255, 95, 95, 1)' }} />
                        </Avatar>
                    </div>
                    <Typography
                        className={classes.title}
                        align="center"
                        variant="h4"
                        children={t('wallet_risk_warning_dialog_title')}
                    />
                    <Typography dangerouslySetInnerHTML={{ __html: t('wallet_risk_warning_content') }} />

                    <Paper elevation={0} className={classes.wallet}>
                        <Typography variant="body1" color="textSecondary">
                            Wallet
                        </Typography>
                        <Typography variant="body1" color="textPrimary">
                            {wallet?.address}
                        </Typography>
                    </Paper>
                </Paper>
            </DialogContent>
            <DialogActions className={classes.buttons}>
                <ActionButton
                    className={classnames(classes.button, classes.cancel)}
                    fullWidth
                    variant="text"
                    color="inherit"
                    onClick={onClose}
                    size="large">
                    {t('cancel')}
                </ActionButton>
                <ActionButton className={classes.button} fullWidth variant="contained" size="large" onClick={onClick}>
                    {t('confirm')}
                </ActionButton>
            </DialogActions>
        </InjectedDialog>
    )
}
