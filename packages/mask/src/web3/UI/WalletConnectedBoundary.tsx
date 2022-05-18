import { makeStyles, useStylesExtends } from '@masknet/theme'
import classNames from 'classnames'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import ActionButton, { ActionButtonProps } from '../../extension/options-page/DashboardComponents/ActionButton'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useI18N } from '../../utils'
import { isZero } from '@masknet/web3-shared-base'
import {
    useAccount,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useNativeTokenBalance,
    useRiskWarningApproved,
} from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()((theme) => ({
    button: {
        backgroundColor: theme.palette.maskColor.dark,
        color: 'white',
        fontSize: 14,
        fontWeight: 700,
        width: '100%',
        '&:hover': {
            backgroundColor: theme.palette.maskColor.dark,
        },
        margin: 0,
    },
    grid: {
        justifyContent: 'center',
        padding: 8,
    },
}))

export interface WalletConnectedBoundaryProps
    extends withClasses<'connectWallet' | 'unlockMetaMask' | 'gasFeeButton' | 'invalidButton' | 'button'> {
    offChain?: boolean
    children?: React.ReactNode
    hideRiskWarningConfirmed?: boolean
    ActionButtonProps?: ActionButtonProps
    startIcon?: React.ReactNode
}

export function WalletConnectedBoundary(props: WalletConnectedBoundaryProps) {
    const { children = null, offChain = false, hideRiskWarningConfirmed = false } = props

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const pluginID = useCurrentWeb3NetworkPluginID()
    const account = useAccount()
    const chainIdValid = useChainId()
    const nativeTokenBalance = useNativeTokenBalance()
    const approved = useRiskWarningApproved()

    const { setDialog: setRiskWarningDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletRiskWarningDialogUpdated,
    )
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    if (!account)
        return (
            <ActionButton
                startIcon={props.startIcon}
                className={classNames(classes.button, classes.connectWallet)}
                fullWidth
                variant="contained"
                onClick={openSelectProviderDialog}
                {...props.ActionButtonProps}>
                {t('plugin_wallet_connect_a_wallet')}
            </ActionButton>
        )

    if (!approved && !hideRiskWarningConfirmed)
        return (
            <ActionButton
                className={classNames(classes.button, classes.connectWallet)}
                fullWidth
                variant="contained"
                onClick={() => {
                    setRiskWarningDialog({
                        open: true,
                        account,
                        pluginID,
                    })
                }}
                {...props.ActionButtonProps}>
                {t('plugin_wallet_confirm_risk_warning')}
            </ActionButton>
        )

    if (isZero(nativeTokenBalance.value ?? '0') && !offChain)
        return (
            <ActionButton
                className={classNames(classes.button, classes.gasFeeButton)}
                disabled={!nativeTokenBalance.error}
                fullWidth
                variant="contained"
                onClick={nativeTokenBalance.retry}
                {...props.ActionButtonProps}>
                {t(nativeTokenBalance.loading ? 'plugin_wallet_update_gas_fee' : 'plugin_wallet_no_gas_fee')}
            </ActionButton>
        )

    if (!chainIdValid && !offChain)
        return (
            <ActionButton
                className={classNames(classes.button, classes.invalidButton)}
                disabled
                fullWidth
                variant="contained"
                {...props.ActionButtonProps}>
                {t('plugin_wallet_invalid_network')}
            </ActionButton>
        )

    return <>{children}</>
}
