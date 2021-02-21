import { createStyles, Grid, makeStyles } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useRemoteControlledDialog } from '../../utils/hooks/useRemoteControlledDialog'
import { useI18N } from '../../utils/i18n-next-ui'
import { useAccount } from '../hooks/useAccount'
import { useChainIdValid } from '../hooks/useChainState'
import { useEtherTokenBalance } from '../hooks/useEtherTokenBalance'

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
    const { value: etherBalance = '0', error: etherBalanceError, retry: retryEtherBalance } = useEtherTokenBalance(
        account,
    )

    //#region remote controlled select provider dialog
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion

    if (!account)
        return (
            <Grid container>
                <ActionButton className={classes.button} fullWidth variant="contained" size="large" onClick={onConnect}>
                    {t('plugin_wallet_connect_a_wallet')}
                </ActionButton>
            </Grid>
        )
    if (new BigNumber(etherBalance).isZero())
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
