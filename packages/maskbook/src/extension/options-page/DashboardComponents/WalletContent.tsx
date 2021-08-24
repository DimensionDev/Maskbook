import { forwardRef, useCallback, useMemo, useState } from 'react'
import { Alert, Box, Button, IconButton, MenuItem, Tab, Tabs } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import AddIcon from '@material-ui/icons/Add'
import MonetizationOnOutlinedIcon from '@material-ui/icons/MonetizationOnOutlined'
import MoreVertOutlinedIcon from '@material-ui/icons/MoreVertOutlined'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Check from '@material-ui/icons/Check'
import { Wallet, useChainIdValid, useChainDetailed, FilterTransactionType } from '@masknet/web3-shared'
import { useModal } from '../DashboardDialogs/Base'
import {
    DashboardWalletAddERC20TokenDialog,
    DashboardWalletAddERC721TokenDialog,
    DashboardWalletBackupDialog,
    DashboardWalletDeleteConfirmDialog,
} from '../DashboardDialogs/Wallet'
import { Flags, useMenu, useI18N, useColorStyles, useMatchXS } from '../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { WalletAssetsTable } from './WalletAssetsTable'
import { PluginTransakMessages } from '../../../plugins/Transak/messages'
import { WalletMessages } from '../../../plugins/Wallet/messages'
import { TransactionList } from './TransactionList'
import { CollectibleList } from './CollectibleList'
import { useHistory, useLocation } from 'react-router'
import { DashboardWalletRoute } from '../Route'

const useStyles = makeStyles()((theme) => ({
    root: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&> *': {
            flex: '0 0 auto',
            overflow: 'auto',
        },
    },
    alert: {
        marginTop: theme.spacing(2),
    },
    caption: {
        padding: theme.spacing(1.5, 0),
    },
    header: {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    content: {
        flex: 1,
    },
    footer: {
        margin: theme.spacing(1),
    },
    title: {
        flex: 1,
        paddingLeft: theme.spacing(1),
    },
    tabs: {},
    addButton: {
        color: theme.palette.primary.main,
    },
    moreButton: {
        color: theme.palette.text.primary,
    },
    assetsTable: {
        flex: 1,
    },
    checkIcon: {
        marginLeft: theme.spacing(1),
    },
}))

interface WalletContentProps {
    wallet: Wallet
}

export const WalletContent = forwardRef<HTMLDivElement, WalletContentProps>(({ wallet }, ref) => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const history = useHistory()
    const location = useLocation()

    const { classes: color } = useColorStyles()
    const xsMatched = useMatchXS()
    const chainIdValid = useChainIdValid()
    const chainDetailed = useChainDetailed()

    const [transactionType, setTransactionType] = useState<FilterTransactionType>(FilterTransactionType.ALL)

    const [addToken, , openAddToken] = useModal(DashboardWalletAddERC20TokenDialog)
    const [walletBackup, , openWalletBackup] = useModal(DashboardWalletBackupDialog)
    const [walletDelete, , openWalletDelete] = useModal(DashboardWalletDeleteConfirmDialog)
    const [addAsset, , openAddAsset] = useModal(DashboardWalletAddERC721TokenDialog)
    const { setDialog: setWalletRenameDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletRenameDialogUpdated,
    )

    const [menu, openMenu] = useMenu([
        <MenuItem
            key="rename"
            onClick={() => {
                setWalletRenameDialog({
                    open: true,
                    wallet,
                })
            }}>
            {t('rename')}
        </MenuItem>,
        wallet.hasPrivateKey ? (
            <MenuItem key="backup" onClick={() => openWalletBackup({ wallet })}>
                {t('backup')}
            </MenuItem>
        ) : null,
        <MenuItem
            key="delete"
            onClick={() => openWalletDelete({ wallet })}
            className={color.error}
            data-testid="delete_button">
            {t('delete')}
        </MenuItem>,
    ])

    const [transactionTypeMenu, openTransactionTypeMenu] = useMenu([
        <MenuItem key="all" onClick={() => setTransactionType(FilterTransactionType.ALL)}>
            {t('all_transactions')}
            {transactionType === FilterTransactionType.ALL ? (
                <Check className={classes.checkIcon} fontSize="small" />
            ) : null}
        </MenuItem>,
        <MenuItem key="send" onClick={() => setTransactionType(FilterTransactionType.SEND)}>
            {t('sent_transactions')}
            {transactionType === FilterTransactionType.SEND ? (
                <Check className={classes.checkIcon} fontSize="small" />
            ) : null}
        </MenuItem>,
        <MenuItem key="receive" onClick={() => setTransactionType(FilterTransactionType.RECEIVE)}>
            {t('received_transactions')}
            {transactionType === FilterTransactionType.RECEIVE ? (
                <Check className={classes.checkIcon} fontSize="small" />
            ) : null}
        </MenuItem>,
    ])

    //#region remote controlled buy dialog
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)
    //#endregion

    //#region tab
    const tab = new URLSearchParams(location.search).get('tab') as DashboardWalletRoute
    const [tabIndex, setTabIndex] = useState(
        tab &&
            [
                DashboardWalletRoute.Tokens,
                DashboardWalletRoute.Collectibles,
                DashboardWalletRoute.Transactions,
            ].includes(tab)
            ? Number(tab)
            : 0,
    )
    const onTabChange = useCallback(
        (_, newTabIndex: number) => {
            setTabIndex(newTabIndex)
            const params = new URLSearchParams()
            params.append('tab', newTabIndex.toString())
            history.push({ search: params.toString() })
        },
        [history],
    )
    //#endregion

    const content = useMemo(() => {
        switch (tabIndex) {
            case 0:
                return <WalletAssetsTable classes={{ container: classes.assetsTable }} wallet={wallet} />
            case 1:
                return <CollectibleList wallet={wallet} />
            case 2:
                return <TransactionList transactionType={transactionType} />
            default:
                return null
        }
    }, [tabIndex, classes, wallet, transactionType])

    if (!chainIdValid)
        return (
            <div className={classes.root} ref={ref}>
                <Alert className={classes.alert} severity="warning">
                    {t('plugin_wallet_wrong_network_tip')}
                </Alert>
            </div>
        )

    return (
        <div className={classes.root} ref={ref}>
            <Box
                className={classes.caption}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                    <Tabs
                        className={classes.tabs}
                        value={tabIndex}
                        indicatorColor="primary"
                        textColor="primary"
                        onChange={onTabChange}>
                        <Tab label={t('dashboard_tab_assets')} />
                        <Tab label={t('dashboard_tab_collectibles')} />
                        <Tab
                            label={
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}>
                                    {t('dashboard_tab_transactions')}
                                    {tabIndex === 2 ? (
                                        <IconButton
                                            sx={{ color: 'inherit', marginLeft: 0.5 }}
                                            size="small"
                                            onClick={openTransactionTypeMenu}>
                                            <ExpandMoreIcon />
                                        </IconButton>
                                    ) : null}
                                </Box>
                            }
                        />
                    </Tabs>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    }}>
                    {!xsMatched && tabIndex === 0 ? (
                        <Button
                            className={classes.addButton}
                            variant="text"
                            onClick={() => openAddToken({ wallet })}
                            startIcon={<AddIcon />}>
                            {t('add_token')}
                        </Button>
                    ) : null}
                    {!xsMatched && tabIndex === 1 ? (
                        <Button
                            className={classes.addButton}
                            variant="text"
                            onClick={() =>
                                openAddAsset({
                                    wallet,
                                })
                            }
                            startIcon={<AddIcon />}>
                            {t('add_asset')}
                        </Button>
                    ) : null}
                    {!xsMatched && Flags.transak_enabled ? (
                        <Button
                            onClick={() => {
                                setBuyDialog({
                                    open: true,
                                    address: wallet.address,
                                    code: chainDetailed?.nativeCurrency.symbol,
                                })
                            }}
                            startIcon={<MonetizationOnOutlinedIcon />}>
                            {t('buy_now')}
                        </Button>
                    ) : null}
                    <IconButton
                        className={classes.moreButton}
                        size="small"
                        onClick={openMenu}
                        data-testid="setting_icon">
                        <MoreVertOutlinedIcon />
                    </IconButton>
                </Box>
            </Box>
            <Box className={classes.content}>{content}</Box>
            {menu}
            {transactionTypeMenu}
            {addToken}
            {addAsset}
            {walletBackup}
            {walletDelete}
        </div>
    )
})
