import { makeStyles, ActionButton, type ActionButtonProps } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useSharedI18N } from '../../../locales/index.js'
import { isZero } from '@masknet/web3-shared-base'
import {
    useChainContext,
    useNetworkContext,
    useNativeTokenBalance,
    useRiskWarningApproved,
    useWallet,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useAsync } from 'react-use'
import { SmartPayBundler } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/shared-base'
import { SelectProviderDialog } from '../../../index.js'

const useStyles = makeStyles()({
    button: {
        margin: 0,
    },
})

export interface WalletConnectedBoundaryProps extends withClasses<'connectWallet' | 'button'> {
    offChain?: boolean
    children?: React.ReactNode
    expectedChainId: Web3Helper.ChainIdAll
    hideRiskWarningConfirmed?: boolean
    ActionButtonProps?: ActionButtonProps
    startIcon?: React.ReactNode
}

export function WalletConnectedBoundary(props: WalletConnectedBoundaryProps) {
    const { children = null, offChain = false, hideRiskWarningConfirmed = false, expectedChainId } = props

    const t = useSharedI18N()
    const { classes, cx } = useStyles(undefined, { props })

    const { pluginID } = useNetworkContext()
    const { account, chainId: chainIdValid } = useChainContext({ chainId: expectedChainId })
    const wallet = useWallet()
    const { value: smartPayChainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

    const nativeTokenBalance = useNativeTokenBalance(undefined, {
        chainId: chainIdValid,
    })
    const approved = useRiskWarningApproved()

    const { setDialog: setRiskWarningDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletRiskWarningDialogUpdated,
    )

    const buttonClass = cx(classes.button, classes.connectWallet)

    if (!account)
        return (
            <ActionButton
                startIcon={props.startIcon}
                className={buttonClass}
                fullWidth
                onClick={() => SelectProviderDialog.open()}
                {...props.ActionButtonProps}>
                {t.plugin_wallet_connect_a_wallet()}
            </ActionButton>
        )

    if (!approved && !hideRiskWarningConfirmed && pluginID === NetworkPluginID.PLUGIN_EVM)
        return (
            <ActionButton
                className={buttonClass}
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
                {t.plugin_wallet_confirm_risk_warning()}
            </ActionButton>
        )

    if (!(wallet?.owner && chainIdValid === smartPayChainId) && isZero(nativeTokenBalance.value ?? '0') && !offChain)
        return (
            <ActionButton
                className={buttonClass}
                disabled={!nativeTokenBalance.error}
                fullWidth
                variant="contained"
                onClick={nativeTokenBalance.retry}
                {...props.ActionButtonProps}>
                {nativeTokenBalance.loading ? t.plugin_wallet_update_gas_fee() : t.plugin_wallet_no_gas_fee()}
            </ActionButton>
        )

    if (!chainIdValid && !offChain)
        return (
            <ActionButton className={buttonClass} disabled fullWidth variant="contained" {...props.ActionButtonProps}>
                {t.plugin_wallet_invalid_network()}
            </ActionButton>
        )

    return <>{children}</>
}
