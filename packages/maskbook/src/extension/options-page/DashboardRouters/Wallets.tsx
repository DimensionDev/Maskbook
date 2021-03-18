import { useEffect, useCallback } from 'react'
import { Button } from '@material-ui/core'
import { makeStyles, createStyles, ThemeProvider } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import RestoreIcon from '@material-ui/icons/Restore'
import DashboardRouterContainer from './Container'
import { useModal } from '../DashboardDialogs/Base'
import {
    DashboardWalletImportDialog,
    DashboardWalletAddERC20TokenDialog,
    DashboardWalletHistoryDialog,
    DashboardWalletErrorDialog,
    DashboardWalletRedPacketDetailDialog,
} from '../DashboardDialogs/Wallet'
import { useI18N } from '../../../utils/i18n-next-ui'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import { Flags } from '../../../utils/flags'
import { useWallet } from '../../../plugins/Wallet/hooks/useWallet'
import { WalletContent } from '../DashboardComponents/WalletContent'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'
import { extendsTheme } from '../../../utils/theme'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../../../plugins/Wallet/messages'

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
                root: {
                    ...theme.typography.body1,
                },
            },
        },
    },
}))
//#endregion

const useStyles = makeStyles((theme) =>
    createStyles({
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
    }),
)

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

    // show create dialog
    useEffect(() => {
        if (create) openWalletImport()
    }, [create, openWalletImport])

    // show error dialog
    useEffect(() => {
        if (error) openWalletError()
    }, [error, openWalletError])

    //#region remote controlled create wallet dialog
    const [, setOpenCreateWalletDialog] = useRemoteControlledDialog(WalletMessages.events.createWalletDialogUpdated)
    const onCreate = useCallback(() => setOpenCreateWalletDialog({ open: true }), [])
    //#endregion

    //#region import wallet dialog
    const onImport = useCallback(() => openWalletImport(), [])
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
                <Button
                    variant="contained"
                    onClick={openWalletImport}
                    endIcon={<AddCircleIcon />}
                    data-testid="create_button">
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
