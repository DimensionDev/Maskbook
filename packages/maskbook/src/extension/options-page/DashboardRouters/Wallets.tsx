import { useEffect, createContext } from 'react'
import type { AssetDetailed, ERC20TokenDetailed } from '../../../web3/types'
import { Button } from '@material-ui/core'
import { makeStyles, createStyles, ThemeProvider } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import RestoreIcon from '@material-ui/icons/Restore'
import DashboardRouterContainer from './Container'
import { useModal } from '../DashboardDialogs/Base'
import {
    DashboardWalletCreateDialog,
    DashboardWalletAddERC20TokenDialog,
    DashboardWalletHistoryDialog,
    DashboardWalletErrorDialog,
    DashboardWalletRedPacketDetailDialog,
} from '../DashboardDialogs/Wallet'
import { useI18N } from '../../../utils/i18n-next-ui'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import { Flags } from '../../../utils/flags'
import { useWallet } from '../../../plugins/Wallet/hooks/useWallet'
import { useTrustedERC20TokensFromDB } from '../../../plugins/Wallet/hooks/useERC20Token'
import { useAssetsDetailed } from '../../../web3/hooks/useAssetsDetailed'
import { WalletContent } from '../DashboardComponents/WalletContent'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'
import { extendsTheme } from '../../../utils/theme'
import { useStableTokensDebank } from '../../../web3/hooks/useStableTokensDebank'

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

export const DashboardWalletsContext = createContext<{
    stableTokens: ERC20TokenDetailed[]
    detailedTokens: AssetDetailed[]
    detailedTokensError: Error | undefined
    detailedTokensLoading: boolean
    detailedTokensRetry: () => void
}>(null!)

export default function DashboardWalletsRouter() {
    const { t } = useI18N()
    const classes = useStyles()
    const { create, error } = useQueryParams(['create', 'error', 'rpid'])

    const [walletCreate, openWalletCreate] = useModal(DashboardWalletCreateDialog)
    const [walletError, openWalletError] = useModal(DashboardWalletErrorDialog)
    const [addToken, , openAddToken] = useModal(DashboardWalletAddERC20TokenDialog)
    const [walletHistory, , openWalletHistory] = useModal(DashboardWalletHistoryDialog)
    const [walletRedPacketDetail, , openWalletRedPacketDetail] = useModal(DashboardWalletRedPacketDetailDialog)

    const selectedWallet = useWallet()
    const tokens = useTrustedERC20TokensFromDB()
    const {
        value: detailedTokens,
        error: detailedTokensError,
        loading: detailedTokensLoading,
        retry: detailedTokensRetry,
    } = useAssetsDetailed(tokens)
    const { value: stableTokens = [] } = useStableTokensDebank()

    // show create dialog
    useEffect(() => {
        if (create) openWalletCreate()
    }, [create, openWalletCreate])

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
                else openWalletCreate()
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
        <DashboardWalletsContext.Provider
            value={{ detailedTokens, stableTokens, detailedTokensLoading, detailedTokensError, detailedTokensRetry }}>
            <DashboardRouterContainer
                empty={!selectedWallet}
                title={t('my_wallets')}
                actions={[
                    <EthereumStatusBar disableEther BoxProps={{ sx: { justifyContent: 'flex-end' } }} />,
                    <Button
                        variant="contained"
                        onClick={openWalletCreate}
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
                {walletCreate}
                {walletError}
                {walletRedPacketDetail}
            </DashboardRouterContainer>
        </DashboardWalletsContext.Provider>
    )
}
