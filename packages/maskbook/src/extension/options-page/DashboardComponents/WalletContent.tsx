import { forwardRef, useCallback, useState } from 'react'
import { Alert, Box, Button, IconButton, MenuItem, Tab, Tabs } from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import MonetizationOnOutlinedIcon from '@material-ui/icons/MonetizationOnOutlined'
import MoreVertOutlinedIcon from '@material-ui/icons/MoreVertOutlined'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Check from '@material-ui/icons/Check'
import { useModal } from '../DashboardDialogs/Base'
import {
    DashboardWalletAddERC20TokenDialog,
    DashboardWalletAddERC721TokenDialog,
    DashboardWalletBackupDialog,
    DashboardWalletDeleteConfirmDialog,
    DashboardWalletRenameDialog,
} from '../DashboardDialogs/Wallet'
import { useMenu } from '../../../utils/hooks/useMenu'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useColorStyles } from '../../../utils/theme'
import { useMatchXS } from '../../../utils/hooks/useMatchXS'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { WalletAssetsTable } from './WalletAssetsTable'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { PluginTransakMessages } from '../../../plugins/Transak/messages'
import { Flags } from '../../../utils/flags'
import { useChainIdValid } from '../../../web3/hooks/useChainState'
import { TransactionList } from './TransactionList'
import { CollectibleList } from './CollectibleList'
import { useHistory, useLocation } from 'react-router'
import { DashboardWalletRoute } from '../Route'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useCollectibles } from '../../../plugins/Wallet/hooks/useCollectibles'
import { CollectibleProvider, FilterTransactionType } from '../../../plugins/Wallet/types'

const useStyles = makeStyles((theme) =>
    createStyles({
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
            padding: theme.spacing(2, 0),
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
    }),
)

interface WalletContentProps {
    wallet: WalletRecord
}

export const WalletContent = forwardRef<HTMLDivElement, WalletContentProps>(({ wallet }, ref) => {
    const { t } = useI18N()
    const classes = useStyles()

    const history = useHistory()
    const location = useLocation()
    const account = useAccount()

    const color = useColorStyles()
    const xsMatched = useMatchXS()
    const chainIdValid = useChainIdValid()

    const [collectiblesPage, setCollectiblesPage] = useState(1)
    const [transactionType, setTransactionType] = useState<FilterTransactionType>(FilterTransactionType.ALL)

    const [addToken, , openAddToken] = useModal(DashboardWalletAddERC20TokenDialog)
    const [walletBackup, , openWalletBackup] = useModal(DashboardWalletBackupDialog)
    const [walletDelete, , openWalletDelete] = useModal(DashboardWalletDeleteConfirmDialog)
    const [walletRename, , openWalletRename] = useModal(DashboardWalletRenameDialog)
    const [addAsset, , openAddAsset] = useModal(DashboardWalletAddERC721TokenDialog)

    const { value: collectibles = [], loading: collectiblesLoading, error: collectiblesError } = useCollectibles(
        account,
        CollectibleProvider.OPENSEAN,
        collectiblesPage,
    )

    const [menu, openMenu] = useMenu([
        <MenuItem key="rename" onClick={() => openWalletRename({ wallet })}>
            {t('rename')}
        </MenuItem>,
        wallet._private_key_ || wallet.mnemonic.length ? (
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
        <MenuItem key="Sent" onClick={() => setTransactionType(FilterTransactionType.SENT)}>
            {t('sent_transactions')}
            {transactionType === FilterTransactionType.SENT ? (
                <Check className={classes.checkIcon} fontSize="small" />
            ) : null}
        </MenuItem>,
        <MenuItem key="Received" onClick={() => setTransactionType(FilterTransactionType.RECEIVE)}>
            {t('received_transactions')}
            {transactionType === FilterTransactionType.RECEIVE ? (
                <Check className={classes.checkIcon} fontSize="small" />
            ) : null}
        </MenuItem>,
    ])

    //#region remote controlled buy dialog
    const [, setBuyDialogOpen] = useRemoteControlledDialog(PluginTransakMessages.events.buyTokenDialogUpdated)
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

    return (
        <div className={classes.root} ref={ref}>
            {!chainIdValid ? (
                <Alert className={classes.alert} severity="warning">
                    {t('plugin_wallet_wrong_network_tip')}
                </Alert>
            ) : null}
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
                                            sx={{ color: 'inherit' }}
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
                                    tokenIdsLoaded: collectibles.map((x) => x.token_id),
                                })
                            }
                            startIcon={<AddIcon />}>
                            {t('add_asset')}
                        </Button>
                    ) : null}
                    {!xsMatched && Flags.transak_enabled ? (
                        <Button
                            onClick={() => {
                                setBuyDialogOpen({
                                    open: true,
                                    address: wallet.address,
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
            <Box className={classes.content}>
                {tabIndex === 0 ? (
                    <WalletAssetsTable classes={{ container: classes.assetsTable }} wallet={wallet} />
                ) : null}
                {tabIndex === 1 ? (
                    <CollectibleList
                        wallet={wallet}
                        page={collectiblesPage}
                        onNextPage={() => setCollectiblesPage((prev) => prev + 1)}
                        collectibles={collectibles}
                        collectiblesLoading={collectiblesLoading}
                        collectiblesError={collectiblesError}
                        collectiblesRetry={() => setCollectiblesPage(1)}
                    />
                ) : null}
                {tabIndex === 2 ? <TransactionList transactionType={transactionType} /> : null}
            </Box>
            {menu}
            {transactionTypeMenu}
            {addToken}
            {addAsset}
            {walletBackup}
            {walletDelete}
            {walletRename}
        </div>
    )
})
