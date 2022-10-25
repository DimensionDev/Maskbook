import { useCallback, useEffect, useState } from 'react'
import classnames from 'classnames'
import { Trans } from 'react-i18next'
import { ActionButtonPromise } from '@masknet/shared'
import { DialogActions, DialogContent, Typography } from '@mui/material'
import { getMaskColor, makeStyles, useCustomSnackbar, ActionButton } from '@masknet/theme'
import { isDashboardPage, NetworkPluginID } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { useI18N } from '../../../../utils/index.js'
import { WalletStatusBox } from '../../../../components/shared/WalletStatusBox/index.js'
import { useLocation } from 'react-router-dom'
import type { WalletRiskWarningDialogEvent } from '@masknet/plugin-wallet'

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
    article: {
        lineHeight: '18px',
        fontWeight: 400,
        marginBottom: theme.spacing(2),
    },
}))

export interface WalletRiskWarningDialogProps {
    closeDialog: () => void
}

export function WalletRiskWarningDialog({ closeDialog }: WalletRiskWarningDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { showSnackbar } = useCustomSnackbar()

    const [account, setAccount] = useState('')
    const [pluginID, setPluginID] = useState<NetworkPluginID>()

    const { RiskWarning } = useWeb3State(pluginID)

    const location = useLocation()
    const state = location.state as WalletRiskWarningDialogEvent | undefined

    useEffect(() => {
        if (!state) return
        setAccount(state.account)
        setPluginID(state.pluginID)
    }, [state])

    const onConfirm = useCallback(async () => {
        if (!account) {
            showSnackbar(t('wallet_risk_warning_no_select_wallet'), {
                variant: 'error',
                preventDuplicate: true,
            })
            return
        }
        await RiskWarning?.approve?.(account)
        closeDialog()
    }, [showSnackbar, account])

    return (
        <>
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
                    onClick={closeDialog}>
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
        </>
    )
}
