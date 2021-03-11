import { useCallback } from 'react'
import { BigNumber } from 'ethers'
import { createStyles, Grid, makeStyles } from '@material-ui/core'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import Services from '../../extension/service'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { currentIsMetamaskLockedSettings, currentSelectedWalletProviderSettings } from '../../plugins/Wallet/settings'
import { useRemoteControlledDialog } from '../../utils/hooks/useRemoteControlledDialog'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { useI18N } from '../../utils/i18n-next-ui'
import { useAccount } from '../hooks/useAccount'
import { useChainIdValid } from '../hooks/useChainState'
import { useEtherTokenBalance } from '../hooks/useEtherTokenBalance'
import { ProviderType } from '../types'

const useStyles = makeStyles((theme) =>
    createStyles({
        button: {
            marginTop: theme.spacing(1.5),
        },
    }),
)

export interface EthereumWalletConnectedBoundaryProps {
    children?: React.ReactNode
}

export function EthereumWalletConnectedBoundary(props: EthereumWalletConnectedBoundaryProps) {
    const { children = null } = props

    const { t } = useI18N()
    const classes = useStyles()

    const account = useAccount()
    const chainIdValid = useChainIdValid()
    const {
        value: etherBalance = BigNumber.from(0),
        loading: etherBalanceLoading,
        error: etherBalanceError,
        retry: retryEtherBalance,
    } = useEtherTokenBalance(account)

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
                <ActionButton className={classes.button} fullWidth variant="contained" size="large" onClick={onConnect}>
                    {t('plugin_wallet_connect_a_wallet')}
                </ActionButton>
            </Grid>
        )

    if (currentSelectedWalletProvider === ProviderType.MetaMask && currentIsMetamaskLocked)
        return (
            <Grid container>
                <ActionButton
                    className={classes.button}
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={onConnectMetaMask}>
                    {t('plugin_wallet_unlock_metamask')}
                </ActionButton>
            </Grid>
        )
    if (etherBalance.isZero())
        return (
            <Grid container>
                <ActionButton
                    className={classes.button}
                    disabled={!etherBalanceError}
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={retryEtherBalance}>
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
