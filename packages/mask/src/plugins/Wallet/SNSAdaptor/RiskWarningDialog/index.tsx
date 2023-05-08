import { useCallback, useState } from 'react'
import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import { DialogActions, DialogContent, Typography } from '@mui/material'
import { getMaskColor, makeStyles, useCustomSnackbar, ActionButton } from '@masknet/theme'
import { InjectedDialog, ActionButtonPromise } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { type NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useI18N, useMatchXS } from '../../../../utils/index.js'
import { WalletStatusBox } from '../../../../components/shared/WalletStatusBox/index.js'

const useStyles = makeStyles()((theme) => ({
    paper: {
        color: getMaskColor(theme).redMain,
        paddingBottom: 0,
        paddingLeft: 16,
        paddingRight: 16,
        '::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 20,
        },
        '::-webkit-scrollbar-thumb': {
            borderRadius: '20px',
            width: 5,
            border: '7px solid rgba(0, 0, 0, 0)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(250, 250, 250, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            backgroundClip: 'padding-box',
        },
    },
    buttons: {
        padding: `${theme.spacing(2)} !important`,
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
    },
    button: {
        borderRadius: Sniffings.is_dashboard_page ? 9999 : undefined,
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
        color: theme.palette.maskColor.danger,
    },
    icon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    article: {
        lineHeight: '18px',
        fontWeight: 400,
        marginBottom: theme.spacing(2),
        color: theme.palette.maskColor.danger,
    },
}))

export function WalletRiskWarningDialog() {
    const { t } = useI18N()
    const { classes, cx } = useStyles()
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
                <Typography className={classes.article}>{t('wallet_risk_warning_confirm_tips')}</Typography>
                <WalletStatusBox disableChange withinRiskWarningDialog />
            </DialogContent>
            <DialogActions className={classes.buttons}>
                <ActionButton
                    className={cx(classes.button, classes.cancel)}
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
