import { useEffect, useCallback } from 'react'
import { Button } from '@material-ui/core'
import { makeStyles, ThemeProvider } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import RestoreIcon from '@material-ui/icons/Restore'
import { useI18N, useQueryParams, Flags, extendsTheme } from '../../../utils'
import DashboardRouterContainer from './Container'
import { useModal } from '../DashboardDialogs/Base'
import {
    DashboardWalletImportDialog,
    DashboardWalletAddERC20TokenDialog,
    DashboardWalletHistoryDialog,
    DashboardWalletErrorDialog,
    DashboardWalletRedPacketDetailDialog,
} from '../DashboardDialogs/Wallet'
import { useWallet } from '../../../plugins/Wallet/hooks/useWallet'
import { WalletContent } from '../DashboardComponents/WalletContent'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'

//#region theme
const walletsTheme = extendsTheme((theme) => ({
    components: {
        MuiIconButton: {
            styleOverrides: {
                root: {
                    color: theme.palette.text.primary,
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    justifyContent: 'center',
                    minWidth: 'unset',
                    marginRight: theme.spacing(2),
                },
            },
        },
        MuiListItemSecondaryAction: {
            styleOverrides: {
                root: theme.typography.body1,
            },
        },
    },
}))
//#endregion

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        flex: '0 0 100%',
        height: '100%',
    },
    content: {
        width: '100%',
        overflow: 'auto',
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
    },
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    caption: {
        display: 'flex',
        alignItems: 'center',
    },
    title: {
        marginLeft: theme.spacing(1),
    },
}))

export default function DashboardWalletsRouter() {
    const { t } = useI18N()
    const classes = useStyles()
    const { create, error } = useQueryParams(['create', 'error', 'rpid'])

    const [walletImport, openWalletImport] = useModal(DashboardWalletImportDialog)
    const [walletError, openWalletError] = useModal(DashboardWalletErrorDialog)
    const [addToken, , openAddToken] = useModal(DashboardWalletAddERC20TokenDialog)
    const [walletHistory, , openWalletHistory] = useModal(DashboardWalletHistoryDialog)
    const [walletRedPacketDetail, , openWalletRedPacketDetail] = useModal(DashboardWalletRedPacketDetailDialog)

    const selectedWallet = useWallet()

    //#region import wallet
    const onImport = useCallback(() => openWalletImport(), [])
    //#endregion

    //#region open dialogs externally
    // show error dialog
    useEffect(() => {
        if (error) openWalletError()
    }, [error, openWalletError])

    // show create dialog
    useEffect(() => {
        if (create) onImport()
    }, [create, onImport])
    //#endregion

    //#region right icons from mobile devices
    const floatingButtons = [
        {
            icon: <AddIcon />,
            handler: () => {
                if (selectedWallet) openAddToken({ wallet: selectedWallet })
                else openWalletImport()
            },
        },
    ]

    if (Flags.has_native_nav_bar)
        floatingButtons.unshift({
            icon: <EthereumStatusBar />,
            handler: () => undefined,
        })

    if (selectedWallet)
        floatingButtons.push({
            icon: <RestoreIcon />,
            handler: () => {
                if (!selectedWallet) return
                openWalletHistory({
                    wallet: selectedWallet,
                    onRedPacketClicked(payload) {
                        openWalletRedPacketDetail({
                            wallet: selectedWallet,
                            payload,
                        })
                    },
                })
            },
        })
    //#endregion

    return (
        <DashboardRouterContainer
            empty={!selectedWallet}
            title={t('my_wallets')}
            actions={[
                <EthereumStatusBar disableEther BoxProps={{ sx: { justifyContent: 'flex-end' } }} />,
                <Button variant="contained" onClick={onImport} endIcon={<AddCircleIcon />} data-testid="create_button">
                    {t('plugin_wallet_on_create')}
                </Button>,
            ]}
            floatingButtons={floatingButtons}>
            <ThemeProvider theme={walletsTheme}>
                <div className={classes.root}>
                    <div className={classes.content}>
                        <div className={classes.wrapper}>
                            {selectedWallet ? <WalletContent wallet={selectedWallet} /> : null}
                        </div>
                    </div>
                </div>
            </ThemeProvider>
            {addToken}
            {walletHistory}
            {walletImport}
            {walletError}
            {walletRedPacketDetail}
        </DashboardRouterContainer>
    )
}
