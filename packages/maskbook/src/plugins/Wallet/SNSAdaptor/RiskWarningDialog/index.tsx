import { Avatar, Button, DialogActions, DialogContent, makeStyles, Paper, Typography } from '@material-ui/core'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useI18N } from '../../../../utils'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import { getMaskColor, useSnackbar } from '@masknet/theme'
import { useCallback } from 'react'
import { WalletMessages } from '../../messages'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useAccount } from '@masknet/web3-shared'
import classnames from 'classnames'
import { Trans } from 'react-i18next'
import { confirmRiskWarning, RiskWaringStatus, setRiskWarningStatus } from '../../services'

const useStyles = makeStyles((theme) => ({
    paper: {
        paddingTop: theme.spacing(2),
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        color: getMaskColor(theme).redMain,
    },
    buttons: {
        padding: theme.spacing(3),
    },
    button: {
        borderRadius: 9999,
    },
    cancel: {
        backgroundColor: getMaskColor(theme).twitterBackground,
        border: 'none',
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
        backgroundColor: getMaskColor(theme).twitterBackground,
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
    const account = useAccount()
    const { enqueueSnackbar } = useSnackbar()
    const { open, setDialog } = useRemoteControlledDialog(WalletMessages.events.walletRiskWarningDialogUpdated)

    const onClose = useCallback(async () => {
        if (account) {
            await setRiskWarningStatus(account, RiskWaringStatus.Unset)
        }
        setDialog({ open: false, type: 'cancel' })
    }, [setDialog])

    const onConfirm = useCallback(async () => {
        if (!account) {
            enqueueSnackbar(t('wallet_risk_warning_no_select_wallet'), {
                variant: 'error',
                preventDuplicate: true,
            })
            return
        }

        await confirmRiskWarning(account)
        setDialog({ open: false, type: 'confirm' })
    }, [enqueueSnackbar, account, setDialog])

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
                    <Typography
                        variant="body2"
                        children={<Trans i18nKey="multiline">{t('wallet_risk_warning_content')}</Trans>}
                    />
                    <Paper elevation={0} className={classes.wallet}>
                        <Typography variant="body1" color="textSecondary">
                            Wallet
                        </Typography>
                        <Typography variant="body1" color="textPrimary">
                            {account}
                        </Typography>
                    </Paper>
                </Paper>
            </DialogContent>
            <DialogActions className={classes.buttons}>
                <Button
                    className={classnames(classes.button, classes.cancel)}
                    fullWidth
                    variant="outlined"
                    onClick={onClose}
                    size="large">
                    {t('cancel')}
                </Button>
                <Button className={classes.button} fullWidth variant="contained" size="large" onClick={onConfirm}>
                    {t('confirm')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
