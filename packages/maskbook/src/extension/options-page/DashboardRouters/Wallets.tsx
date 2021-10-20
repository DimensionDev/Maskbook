import { useEffect } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { makeStyles } from '@masknet/theme'
import AddIcon from '@mui/icons-material/Add'
import { useWallet } from '@masknet/web3-shared-evm'
import { useI18N, useQueryParams, Flags, extendsTheme } from '../../../utils'
import DashboardRouterContainer from './Container'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardWalletAddERC20TokenDialog, DashboardWalletErrorDialog } from '../DashboardDialogs/Wallet'
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

const useStyles = makeStyles()((theme) => ({
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
    const { classes } = useStyles()
    const { create, error } = useQueryParams(['create', 'error', 'rpid'])

    const [walletError, openWalletError] = useModal(DashboardWalletErrorDialog)
    const [addToken, , openAddToken] = useModal(DashboardWalletAddERC20TokenDialog)

    const selectedWallet = useWallet()

    //#region open dialogs externally
    // show error dialog
    useEffect(() => {
        if (error) openWalletError()
    }, [error, openWalletError])

    //#region right icons from mobile devices
    const floatingButtons = [
        {
            icon: <AddIcon />,
            handler: () => {
                if (selectedWallet) openAddToken({ wallet: selectedWallet })
            },
        },
    ]

    if (Flags.has_native_nav_bar)
        floatingButtons.unshift({
            icon: <EthereumStatusBar />,
            handler: () => undefined,
        })
    //#endregion

    return (
        <DashboardRouterContainer
            empty={!selectedWallet}
            title={t('my_wallets')}
            actions={[<EthereumStatusBar disableNativeToken BoxProps={{ sx: { justifyContent: 'flex-end' } }} />]}
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
            {walletError}
        </DashboardRouterContainer>
    )
}
