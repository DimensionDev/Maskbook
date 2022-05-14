import { Grid } from '@mui/material'
import { makeStyles, MaskColorVar, useStylesExtends } from '@masknet/theme'
import classNames from 'classnames'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import ActionButton, { ActionButtonProps } from '../../extension/options-page/DashboardComponents/ActionButton'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useI18N } from '../../utils'
import { useAccount, useChainIdValid, useNativeTokenBalance } from '@masknet/web3-shared-evm'
import { isZero } from '@masknet/web3-shared-base'
import { useWalletRiskWarningDialog } from '../../plugins/Wallet/hooks/useWalletRiskWarningDialog'
import { usePersonaConnectStatus } from '../../components/DataSource/usePersonaConnectStatus'
import { useMemo } from 'react'

const useStyles = makeStyles()((theme) => ({
    button: {
        backgroundColor: MaskColorVar.buttonPluginBackground,
        color: 'white',
        fontSize: 14,
        fontWeight: 700,
        width: '100%',
        '&:hover': {
            backgroundColor: MaskColorVar.buttonPluginBackground,
        },
    },
    grid: {
        justifyContent: 'center',
    },
}))

export interface EthereumWalletConnectedBoundaryProps
    extends withClasses<'connectWallet' | 'unlockMetaMask' | 'gasFeeButton' | 'invalidButton' | 'button'> {
    offChain?: boolean
    children?: React.ReactNode
    hideRiskWarningConfirmed?: boolean
    ActionButtonProps?: ActionButtonProps
    startIcon?: React.ReactNode
    hiddenPersonaVerified?: boolean
}

export function EthereumWalletConnectedBoundary(props: EthereumWalletConnectedBoundaryProps) {
    const { children = null, offChain = false, hideRiskWarningConfirmed = false, hiddenPersonaVerified = false } = props

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const chainIdValid = useChainIdValid()
    const nativeTokenBalance = useNativeTokenBalance()

    const personaConnectStatus = usePersonaConnectStatus()

    // #region remote controlled confirm risk warning
    const { isConfirmed: isRiskWarningConfirmed, openDialog: openRiskWarningDialog } = useWalletRiskWarningDialog()
    // #endregion

    // #region remote controlled select provider dialog
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    // #endregion

    const actionButton = useMemo(() => {
        if (!personaConnectStatus.action) return null

        const button = personaConnectStatus.hasPersona ? t('connect_persona') : t('create_persona')
        return (
            <ActionButton
                variant="contained"
                className={classNames(classes.button, classes.connectWallet)}
                onClick={personaConnectStatus.action}>
                {button}
            </ActionButton>
        )
    }, [personaConnectStatus, t])

    if (!hiddenPersonaVerified && (!personaConnectStatus.hasPersona || !personaConnectStatus.connected)) {
        return <>{actionButton}</>
    }

    if (!account)
        return (
            <Grid container className={classes.grid}>
                <ActionButton
                    startIcon={props.startIcon}
                    className={classNames(classes.button, classes.connectWallet)}
                    fullWidth
                    variant="contained"
                    onClick={openSelectProviderDialog}
                    {...props.ActionButtonProps}>
                    {t('plugin_wallet_connect_a_wallet')}
                </ActionButton>
            </Grid>
        )

    if (!isRiskWarningConfirmed && !hideRiskWarningConfirmed)
        return (
            <Grid container className={classes.grid}>
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
            <Grid container className={classes.grid}>
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
            <Grid container className={classes.grid}>
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

    return (
        <Grid container className={classes.grid}>
            {children}
        </Grid>
    )
}
