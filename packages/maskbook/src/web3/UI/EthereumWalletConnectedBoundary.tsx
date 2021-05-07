import { createStyles, Grid, makeStyles } from '@material-ui/core'
import classNames from 'classnames'
import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import Services from '../../extension/service'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { currentIsMetamaskLockedSettings, currentSelectedWalletProviderSettings } from '../../plugins/Wallet/settings'
import { useRemoteControlledDialog } from '../../utils/hooks/useRemoteControlledDialog'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { useI18N } from '../../utils/i18n-next-ui'
import { ProviderType } from '../types'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { ChainState } from '../state/useChainState'

const useStyles = makeStyles((theme) =>
    createStyles({
        button: {
            marginTop: theme.spacing(1.5),
        },
    }),
)

export interface EthereumWalletConnectedBoundaryProps extends withClasses<'connectWallet' | 'unlockMetaMask'> {
    offChain?: boolean
    children?: React.ReactNode
}

export function EthereumWalletConnectedBoundary(props: EthereumWalletConnectedBoundaryProps) {
    const { children = null, offChain = false } = props

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const { account, chainIdValid, chainTokenBalance } = ChainState.useContainer()

    //#region remote controlled select provider dialog
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
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
                    onClick={onConnect}>
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

    if (new BigNumber(chainTokenBalance.value ?? '0').isZero() && !offChain)
        return (
            <Grid container>
                <ActionButton
                    className={classes.button}
                    disabled={!chainTokenBalance.error}
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={chainTokenBalance.retry}>
                    {t('plugin_wallet_no_gas_fee')}
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
