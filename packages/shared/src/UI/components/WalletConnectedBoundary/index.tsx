import { makeStyles, ActionButton, type ActionButtonProps } from '@masknet/theme'
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
import { SelectProviderModal, WalletRiskWarningModal } from '../../modals/modals.js'
import { Trans } from '@lingui/macro'

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
    noGasText?: string
}

export function WalletConnectedBoundary(props: WalletConnectedBoundaryProps) {
    const { children = null, offChain = false, hideRiskWarningConfirmed = false, expectedChainId, noGasText } = props
    const { classes, cx } = useStyles(undefined, { props })

    const { pluginID } = useNetworkContext()
    const { account, chainId: chainIdValid } = useChainContext({ chainId: expectedChainId })
    const wallet = useWallet()
    const { value: smartPayChainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

    const nativeTokenBalance = useNativeTokenBalance(undefined, {
        chainId: chainIdValid,
    })
    const approved = useRiskWarningApproved()

    const buttonClass = cx(classes.button, classes.connectWallet)

    if (!account)
        return (
            <ActionButton
                startIcon={props.startIcon}
                className={buttonClass}
                fullWidth
                onClick={() => SelectProviderModal.open()}
                {...props.ActionButtonProps}>
                <Trans>Connect Wallet</Trans>
            </ActionButton>
        )

    if (!approved && !hideRiskWarningConfirmed && pluginID === NetworkPluginID.PLUGIN_EVM)
        return (
            <ActionButton
                className={buttonClass}
                fullWidth
                variant="contained"
                onClick={() => {
                    WalletRiskWarningModal.open({
                        account,
                        pluginID,
                    })
                }}
                {...props.ActionButtonProps}>
                <Trans>Confirm Risk Warning</Trans>
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
                {nativeTokenBalance.loading ?
                    <Trans>Updating Gas Fee…</Trans>
                :   noGasText ?? <Trans>No Enough Gas Fee</Trans>}
            </ActionButton>
        )

    if (!chainIdValid && !offChain)
        return (
            <ActionButton className={buttonClass} disabled fullWidth variant="contained" {...props.ActionButtonProps}>
                <Trans>Invalid Network</Trans>
            </ActionButton>
        )

    return <>{children}</>
}
