import { useCallback } from 'react'
import { Icons } from '@masknet/icons'
import { DialogActions, DialogContent, Typography } from '@mui/material'
import { getMaskColor, makeStyles, useCustomSnackbar, ActionButton } from '@masknet/theme'
import { InjectedDialog, ActionButtonPromise, WalletStatusBox, SharedTrans } from '@masknet/shared'
import { type NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { useMatchXS } from '@masknet/shared-base-ui'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { Trans } from '@lingui/macro'

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
        scrollbarWidth: 'none',
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

interface WalletRiskWarningProps {
    account: string
    pluginID: NetworkPluginID
    open: boolean
    onClose: () => void
}

export function WalletRiskWarning({ account, open, pluginID, onClose }: WalletRiskWarningProps) {
    const { classes, cx } = useStyles()
    const { showSnackbar } = useCustomSnackbar()
    const isMobile = useMatchXS()

    const { RiskWarning } = useWeb3State(pluginID)

    const onConfirm = useCallback(async () => {
        try {
            if (!account) {
                showSnackbar(<Trans>No wallet selected.</Trans>, {
                    variant: 'error',
                    preventDuplicate: true,
                })
                return
            }
            await RiskWarning?.approve?.(account)
            onClose()
        } catch {
            // do nothing
        }
    }, [showSnackbar, account, onClose])

    return (
        <InjectedDialog title={isMobile ? undefined : <Trans>Risk Warning</Trans>} open={open} onClose={onClose}>
            <DialogContent className={classes.paper}>
                <div className={classes.icon}>
                    <Icons.Warning size={90} sx={{ filter: 'drop-shadow(0px 6px 12px rgba(255, 53, 69, 0.2))' }} />
                </div>
                <Typography
                    className={classes.title}
                    align="center"
                    variant="h4"
                    children={<Trans>Risk Warning</Trans>}
                />
                <Typography
                    className={classes.article}
                    variant="body2"
                    children={
                        // eslint-disable-next-line react/naming-convention/component-name
                        <SharedTrans.wallet_risk_warning_content
                            components={{
                                br: <br />,
                            }}
                        />
                    }
                />
                <Typography className={classes.article}>
                    <Trans>By confirming means that you agree to bear the possible risks above.</Trans>
                </Typography>
                <WalletStatusBox disableChange withinRiskWarningDialog />
            </DialogContent>
            <DialogActions className={classes.buttons}>
                <ActionButton
                    className={cx(classes.button, classes.cancel)}
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    onClick={onClose}>
                    <Trans>Cancel</Trans>
                </ActionButton>
                <ActionButtonPromise
                    className={classes.button}
                    fullWidth
                    disabled={!account}
                    init={<Trans>Confirm</Trans>}
                    waiting={<Trans>Confirming</Trans>}
                    failed={<Trans>Failed to confirm</Trans>}
                    executor={onConfirm}
                    completeIcon={null}
                    failIcon={null}
                    failedOnClick="use executor"
                    complete={<Trans>Done</Trans>}
                />
            </DialogActions>
        </InjectedDialog>
    )
}
