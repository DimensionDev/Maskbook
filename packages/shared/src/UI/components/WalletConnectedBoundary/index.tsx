import { makeStyles, ActionButton, type ActionButtonProps } from '@masknet/theme'
import { useSharedTrans } from '../../../locales/index.js'
import { isZero } from '@masknet/web3-shared-base'
import { useChainContext, useNetworkContext, useNativeTokenBalance } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'

const useStyles = makeStyles()({
    button: {
        margin: 0,
    },
})

export interface WalletConnectedBoundaryProps extends withClasses<'connectWallet' | 'button'> {
    offChain?: boolean
    children?: React.ReactNode
    expectedChainId: Web3Helper.ChainIdAll
    ActionButtonProps?: ActionButtonProps
    startIcon?: React.ReactNode
    noGasText?: string
}

export function WalletConnectedBoundary(props: WalletConnectedBoundaryProps) {
    const { children = null, offChain = false, expectedChainId, noGasText } = props

    const t = useSharedTrans()
    const { classes, cx } = useStyles(undefined, { props })

    const { pluginID } = useNetworkContext()
    const { account, chainId: chainIdValid } = useChainContext({ chainId: expectedChainId })

    const nativeTokenBalance = useNativeTokenBalance(undefined, {
        chainId: chainIdValid,
    })

    const buttonClass = cx(classes.button, classes.connectWallet)

    if (!account)
        return (
            <ActionButton startIcon={props.startIcon} className={buttonClass} fullWidth {...props.ActionButtonProps}>
                {t.plugin_wallet_connect_a_wallet()}
            </ActionButton>
        )

    if (isZero(nativeTokenBalance.value ?? '0') && !offChain)
        return (
            <ActionButton
                className={buttonClass}
                disabled={!nativeTokenBalance.error}
                fullWidth
                variant="contained"
                onClick={nativeTokenBalance.retry}
                {...props.ActionButtonProps}>
                {nativeTokenBalance.loading ?
                    t.plugin_wallet_update_gas_fee()
                :   noGasText ?? t.plugin_wallet_no_gas_fee()}
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
