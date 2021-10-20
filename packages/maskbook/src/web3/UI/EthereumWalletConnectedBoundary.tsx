import { Grid } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import { useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import ActionButton, { ActionButtonProps } from '../../extension/options-page/DashboardComponents/ActionButton'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useI18N } from '../../utils'
import { isZero, useAccount, useChainIdValid, useNativeTokenBalance } from '@masknet/web3-shared-evm'
import { useWalletRiskWarningDialog } from '../../plugins/Wallet/hooks/useWalletRiskWarningDialog'

const useStyles = makeStyles()((theme) => ({
    button: {
        marginTop: theme.spacing(1.5),
    },
}))

export interface EthereumWalletConnectedBoundaryProps
    extends withClasses<'connectWallet' | 'unlockMetaMask' | 'gasFeeButton' | 'invalidButton'> {
    offChain?: boolean
    children?: React.ReactNode
    hideRiskWarningConfirmed?: boolean
    ActionButtonProps?: ActionButtonProps
}

export function EthereumWalletConnectedBoundary(props: EthereumWalletConnectedBoundaryProps) {
    const { children = null, offChain = false, hideRiskWarningConfirmed = false } = props

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const chainIdValid = useChainIdValid()
    const nativeTokenBalance = useNativeTokenBalance()

    //#region remote controlled confirm risk warning
    const { isConfirmed: isRiskWarningConfirmed, openDialog: openRiskWarningDialog } = useWalletRiskWarningDialog()
    //#endregion

    //#region remote controlled select provider dialog
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    //#endregion

    if (!account)
        return (
            <Grid container>
                <ActionButton
                    className={classNames(classes.button, classes.connectWallet)}
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={openSelectProviderDialog}
                    {...props.ActionButtonProps}>
                    {t('plugin_wallet_connect_a_wallet')}
                </ActionButton>
            </Grid>
        )

    if (!isRiskWarningConfirmed && !hideRiskWarningConfirmed)
        return (
            <Grid container>
                <ActionButton
                    className={classNames(classes.button, classes.connectWallet)}
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={openRiskWarningDialog}
                    {...props.ActionButtonProps}>
                    {t('plugin_wallet_confirm_risk_warning')}
                </ActionButton>
            </Grid>
        )

    if (isZero(nativeTokenBalance.value ?? '0') && !offChain)
        return (
            <Grid container>
                <ActionButton
                    className={classNames(classes.button, classes.gasFeeButton)}
                    disabled={!nativeTokenBalance.error}
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={nativeTokenBalance.retry}
                    {...props.ActionButtonProps}>
                    {t(nativeTokenBalance.loading ? 'plugin_wallet_update_gas_fee' : 'plugin_wallet_no_gas_fee')}
                </ActionButton>
            </Grid>
        )

    if (!chainIdValid && !offChain)
        return (
            <Grid container>
                <ActionButton
                    className={classNames(classes.button, classes.invalidButton)}
                    disabled
                    fullWidth
                    variant="contained"
                    size="large"
                    {...props.ActionButtonProps}>
                    {t('plugin_wallet_invalid_network')}
                </ActionButton>
            </Grid>
        )

    return <Grid container>{children}</Grid>
}
