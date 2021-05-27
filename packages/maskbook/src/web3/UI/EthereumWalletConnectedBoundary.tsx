import { Grid, makeStyles } from '@material-ui/core'
import classNames from 'classnames'
import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import Services from '../../extension/service'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { currentIsMetamaskLockedSettings, currentSelectedWalletProviderSettings } from '../../plugins/Wallet/settings'
import { useRemoteControlledDialog, useValueRef, useI18N } from '../../utils'
import { ProviderType } from '../types'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { ChainState } from '../state/useChainState'

const useStyles = makeStyles((theme) => ({
    button: {
        marginTop: theme.spacing(1.5),
    },
}))

export interface EthereumWalletConnectedBoundaryProps extends withClasses<'connectWallet' | 'unlockMetaMask'> {
    offChain?: boolean
    children?: React.ReactNode
}

export function EthereumWalletConnectedBoundary(props: EthereumWalletConnectedBoundaryProps) {
    const { children = null, offChain = false } = props

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const { account, chainIdValid, nativeTokenBalance } = ChainState.useContainer()

    //#region remote controlled select provider dialog
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    //#endregion

    //#region metamask
    const currentSelectedWalletProvider = useValueRef(currentSelectedWalletProviderSettings)
    const currentIsMetamaskLocked = useValueRef(currentIsMetamaskLockedSettings)
    const onConnectMetaMask = useCallback(async () => {
        await Services.Ethereum.connectMetaMask()
    }, [])
    //#endregion

    if (!account)
        return (
            <Grid container>
                <ActionButton
                    className={classNames(classes.button, classes.connectWallet)}
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={openSelectProviderDialog}>
                    {t('plugin_wallet_connect_a_wallet')}
                </ActionButton>
            </Grid>
        )

    if (currentSelectedWalletProvider === ProviderType.MetaMask && currentIsMetamaskLocked)
        return (
            <Grid container>
                <ActionButton
                    className={classNames(classes.button, classes.unlockMetaMask)}
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={onConnectMetaMask}>
                    {t('plugin_wallet_unlock_metamask')}
                </ActionButton>
            </Grid>
        )

    if (new BigNumber(nativeTokenBalance.value ?? '0').isZero() && !offChain)
        return (
            <Grid container>
                <ActionButton
                    className={classes.button}
                    disabled={!nativeTokenBalance.error}
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={nativeTokenBalance.retry}>
                    {t(nativeTokenBalance.loading ? 'plugin_wallet_update_gas_fee' : 'plugin_wallet_no_gas_fee')}
                </ActionButton>
            </Grid>
        )

    if (!chainIdValid)
        return (
            <Grid container>
                <ActionButton className={classes.button} disabled fullWidth variant="contained" size="large">
                    {t('plugin_wallet_invalid_network')}
                </ActionButton>
            </Grid>
        )
    return <Grid container>{children}</Grid>
}
