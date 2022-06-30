import { useCallback, useState } from 'react'
import classnames from 'classnames'
import { Trans } from 'react-i18next'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { Avatar, Button, DialogActions, DialogContent, Paper, Typography } from '@mui/material'
import { getMaskColor, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'
import { useI18N, useMatchXS } from '../../../../utils'
import { WalletMessages } from '../../messages'
import { ActionButtonPromise } from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { isDashboardPage } from '@masknet/shared-base'

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
        borderRadius: isDashboardPage() ? 9999 : undefined,
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
            marginBottom: theme.spacing(2),
        },
    },
    cancel: {},
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
        backgroundColor: theme.palette.background.default,
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        borderRadius: theme.spacing(1),
    },
    texts: {
        paddingBottom: theme.spacing(1),
    },
}))

export function WalletRiskWarningDialog() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { showSnackbar } = useCustomSnackbar()
    const isMobile = useMatchXS()

    const [account, setAccount] = useState('')
    const [pluginID, setPluginID] = useState<NetworkPluginID>()

    const { RiskWarning, Others } = useWeb3State(pluginID)

    const { open, setDialog: setRiskWarningDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletRiskWarningDialogUpdated,
        (ev) => {
            if (!ev.open) return
            setAccount(ev.account)
            setPluginID(ev.pluginID)
        },
    )

    const onClose = useCallback(async () => {
        setRiskWarningDialog({ open: false })
    }, [setRiskWarningDialog])

    const onConfirm = useCallback(async () => {
        if (!account) {
            showSnackbar(t('wallet_risk_warning_no_select_wallet'), {
                variant: 'error',
                preventDuplicate: true,
            })
            return
        }
        await RiskWarning?.approve?.(account)
        setRiskWarningDialog({ open: false })
    }, [showSnackbar, account, setRiskWarningDialog])

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
                        <Typography variant="body1" color="textSecondary" className={classes.texts}>
                            {t('nft_wallet_label')}
                        </Typography>
                        <Typography variant="body1" color="textPrimary" className={classes.texts}>
                            {isMobile ? Others?.formatAddress(account, 5) : account}
                        </Typography>
                    </Paper>
                </Paper>
            </DialogContent>
            <DialogActions className={classes.buttons}>
                <Button
                    className={classnames(classes.button, classes.cancel, 'dashboard-style')}
                    fullWidth
                    onClick={onClose}
                    size="large">
                    {t('cancel')}
                </Button>
                <ActionButtonPromise
                    className={classes.button}
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
