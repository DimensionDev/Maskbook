import { Grid } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import classNames from 'classnames'
import { isZero } from '@masknet/web3-shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { NetworkPluginID, useAccount, useBalance, useChainIdValid, useWeb3State } from '@masknet/plugin-infra/web3'
import ActionButton, { ActionButtonProps } from '../../extension/options-page/DashboardComponents/ActionButton'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useI18N } from '../../utils'

const useStyles = makeStyles()((theme) => ({
    button: {
        marginTop: theme.spacing(1.5),
    },
}))

export interface EthereumWalletConnectedBoundaryProps
    extends withClasses<'connectWallet' | 'unlockMetaMask' | 'gasFeeButton' | 'invalidButton' | 'button'> {
    offChain?: boolean
    children?: React.ReactNode
    hideRiskWarningConfirmed?: boolean
    ActionButtonProps?: ActionButtonProps
}

export function EthereumWalletConnectedBoundary(props: EthereumWalletConnectedBoundaryProps) {
    const { children = null, offChain = false, hideRiskWarningConfirmed = false } = props

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainIdValid = useChainIdValid(NetworkPluginID.PLUGIN_EVM)
    const balance = useBalance(NetworkPluginID.PLUGIN_EVM)
    const { RiskWarning } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const { setDialog: setRiskWarningDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletRiskWarningDialogUpdated,
    )

    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    // #endregion

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

    if (!RiskWarning?.isApproved?.(account) && !hideRiskWarningConfirmed)
        return (
            <Grid container>
                <ActionButton
                    className={classNames(classes.button, classes.connectWallet)}
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => {
                        setRiskWarningDialog({
                            open: true,
                            account,
                            pluginID: NetworkPluginID.PLUGIN_EVM,
                        })
                    }}
                    {...props.ActionButtonProps}>
                    {t('plugin_wallet_confirm_risk_warning')}
                </ActionButton>
            </Grid>
        )

    if (isZero(balance.value ?? '0') && !offChain)
        return (
            <Grid container>
                <ActionButton
                    className={classNames(classes.button, classes.gasFeeButton)}
                    disabled={!balance.error}
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={balance.retry}
                    {...props.ActionButtonProps}>
                    {t(balance.loading ? 'plugin_wallet_update_gas_fee' : 'plugin_wallet_no_gas_fee')}
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
