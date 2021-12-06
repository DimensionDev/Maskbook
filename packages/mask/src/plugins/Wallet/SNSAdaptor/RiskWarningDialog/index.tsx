import { useCallback } from 'react'
import classnames from 'classnames'
import { Trans } from 'react-i18next'
import { useRemoteControlledDialog } from '@masknet/shared'
import { formatEthereumAddress, useAccount } from '@masknet/web3-shared-evm'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'
import { Avatar, Button, DialogActions, DialogContent, Paper, Typography } from '@mui/material'
import { getMaskColor, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useI18N, useMatchXS } from '../../../../utils'
import { WalletMessages, WalletRPC } from '../../messages'
import { ActionButtonPromise } from '../../../../extension/options-page/DashboardComponents/ActionButton'

const useStyles = makeStyles()((theme) => ({
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
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
            marginBottom: theme.spacing(2),
        },
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
    const { classes } = useStyles()
    const account = useAccount()
    const { showSnackbar } = useCustomSnackbar()
    const isMobile = useMatchXS()
    const { open, setDialog } = useRemoteControlledDialog(WalletMessages.events.walletRiskWarningDialogUpdated)

    const onClose = useCallback(async () => {
        if (account) await WalletRPC.setRiskWarningConfirmed(account, false)
        setDialog({ open: false, type: 'cancel' })
    }, [setDialog])

    const onConfirm = useCallback(async () => {
        if (!account) {
            showSnackbar(t('wallet_risk_warning_no_select_wallet'), {
                variant: 'error',
                preventDuplicate: true,
            })
            return
        }
        await WalletRPC.confirmRiskWarning(account)
        setDialog({ open: false, type: 'confirm' })
    }, [showSnackbar, account, setDialog])

    return (
        <InjectedDialog
            title={isMobile ? undefined : t('wallet_risk_warning_dialog_title')}
            open={open}
            onClose={onClose}>
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
                    <Paper elevation={0} className={`${classes.wallet} dashboard-style`}>
                        <Typography variant="body1" color="textSecondary">
                            {t('nft_wallet_label')}
                        </Typography>
                        <Typography variant="body1" color="textPrimary">
                            {isMobile ? formatEthereumAddress(account, 5) : account}
                        </Typography>
                    </Paper>
                </Paper>
            </DialogContent>
            <DialogActions className={classes.buttons}>
                <Button
                    className={classnames(classes.button, classes.cancel, 'dashboard-style')}
                    fullWidth
                    variant="outlined"
                    onClick={onClose}
                    size="large">
                    {t('cancel')}
                </Button>
                <ActionButtonPromise
                    className={classes.button}
                    variant="contained"
                    fullWidth
                    disabled={!account}
                    size="large"
                    init={t('confirm')}
                    waiting={t('wallet_risk_confirm_confirming')}
                    failed={t('wallet_risk_confirm_failed')}
                    executor={onConfirm}
                    completeIcon={null}
                    failIcon={null}
                    failedOnClick="use executor"
                    complete={t('done')}
                />
            </DialogActions>
        </InjectedDialog>
    )
}
