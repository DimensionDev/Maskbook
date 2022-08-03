import { useCallback, useState } from 'react'
import classnames from 'classnames'
import { Trans } from 'react-i18next'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { DialogActions, DialogContent, Typography } from '@mui/material'
import { getMaskColor, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useI18N, useMatchXS } from '../../../../utils'
import { WalletMessages } from '../../messages'
import { WalletStatusBox } from '../../../../components/shared/WalletStatusBox'
import ActionButton, { ActionButtonPromise } from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { isDashboardPage } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    paper: {
        color: getMaskColor(theme).redMain,
        paddingBottom: 0,
        paddingLeft: 16,
        paddingRight: 16,
        overflowY: 'hidden',
    },
    buttons: {
        padding: `${theme.spacing(2)} !important`,
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
    },
    button: {
        borderRadius: isDashboardPage() ? 9999 : undefined,
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
            marginBottom: theme.spacing(2),
        },
    },
    cancel: {},
    title: {
        margin: theme.spacing(2, 0),
        fontSize: 24,
        fontWeight: 700,
        lineHeight: '28.8px',
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
    article: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 400,
        marginBottom: theme.spacing(2),
    },
}))

export function WalletRiskWarningDialog() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { showSnackbar } = useCustomSnackbar()
    const isMobile = useMatchXS()

    const [account, setAccount] = useState('')
    const [pluginID, setPluginID] = useState<NetworkPluginID>()

    const { RiskWarning } = useWeb3State(pluginID)

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
            <DialogContent className={classes.paper}>
                <div className={classes.icon}>
                    <Icons.Warning size={90} sx={{ filter: 'drop-shadow(0px 6px 12px rgba(255, 53, 69, 0.2))' }} />
                </div>
                <Typography
                    className={classes.title}
                    align="center"
                    variant="h4"
                    children={t('wallet_risk_warning_dialog_title')}
                />
                <Typography
                    className={classes.article}
                    variant="body2"
                    children={<Trans i18nKey="multiline">{t('wallet_risk_warning_content')}</Trans>}
                />
                <WalletStatusBox disableChange withinRiskWarningDialog />
            </DialogContent>
            <DialogActions className={classes.buttons}>
                <ActionButton
                    className={classnames(classes.button, classes.cancel)}
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    onClick={onClose}>
                    {t('cancel')}
                </ActionButton>
                <ActionButtonPromise
                    className={classes.button}
                    fullWidth
                    disabled={!account}
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
