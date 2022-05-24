import { makeStyles, useStylesExtends } from '@masknet/theme'
import classNames from 'classnames'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import type { ActionButtonProps } from '../../extension/options-page/DashboardComponents/ActionButton'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useI18N } from '../../utils'
import { useAccount, useChainIdValid, useNativeTokenBalance } from '@masknet/web3-shared-evm'
import { isZero } from '@masknet/web3-shared-base'
import { useWalletRiskWarningDialog } from '../../plugins/Wallet/hooks/useWalletRiskWarningDialog'
import { WalletStatusBar } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    button: {
        margin: 0,
    },
    timeline: {
        backgroundColor: theme.palette.maskColor.dark,
        color: 'white',
        fontSize: 14,
        fontWeight: 700,
        width: '100%',
        '&:hover': {
            backgroundColor: theme.palette.maskColor.dark,
        },
    },
}))

export interface EthereumWalletConnectedBoundaryProps
    extends withClasses<'connectWallet' | 'unlockMetaMask' | 'gasFeeButton' | 'invalidButton' | 'button'> {
    offChain?: boolean
    children?: React.ReactNode
    hideRiskWarningConfirmed?: boolean
    ActionButtonProps?: ActionButtonProps
    startIcon?: React.ReactNode
    renderInTimeline?: boolean
}

export function EthereumWalletConnectedBoundary(props: EthereumWalletConnectedBoundaryProps) {
    const { children = null, offChain = false, hideRiskWarningConfirmed = false, renderInTimeline = false } = props

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const chainIdValid = useChainIdValid()
    const nativeTokenBalance = useNativeTokenBalance()

    // #region remote controlled confirm risk warning
    const { isConfirmed: isRiskWarningConfirmed, openDialog: openRiskWarningDialog } = useWalletRiskWarningDialog()
    // #endregion

    // #region remote controlled select provider dialog
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    // #endregion

    // TODO: will remove  this and extract new boundary for timeline
    const buttonClass = classNames(
        classNames(classes.button, classes.connectWallet, renderInTimeline ? classes.timeline : null),
    )
    if (!account)
        return (
            <WalletStatusBar
                actionProps={{
                    action: openSelectProviderDialog,
                    title: t('plugin_wallet_connect_a_wallet'),
                }}
                classes={{ button: classNames(classes.button, classes.connectWallet) }}
            />
        )

    if (!isRiskWarningConfirmed && !hideRiskWarningConfirmed)
        return (
            <WalletStatusBar
                actionProps={{
                    title: t('plugin_wallet_confirm_risk_warning'),
                    action: openRiskWarningDialog,
                }}
                classes={{ button: classNames(classes.button, classes.connectWallet) }}
            />
        )

    if (isZero(nativeTokenBalance.value ?? '0') && !offChain)
        return (
            <WalletStatusBar
                actionProps={{
                    disabled: !nativeTokenBalance.error,
                    action: nativeTokenBalance.retry,
                    title: t(nativeTokenBalance.loading ? 'plugin_wallet_update_gas_fee' : 'plugin_wallet_no_gas_fee'),
                }}
                classes={{ button: classNames(classes.button, classes.gasFeeButton) }}
            />
        )

    if (!chainIdValid && !offChain)
        return (
            <WalletStatusBar
                actionProps={{
                    title: t('plugin_wallet_invalid_network'),
                    disabled: true,
                }}
                classes={{ button: classNames(classes.button, classes.invalidButton) }}
            />
        )

    return <>{children}</>
}
