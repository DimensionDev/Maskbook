import React, { useMemo, useState, useEffect } from 'react'
import DashboardRouterContainer from './Container'
import { Button, Typography, Box, IconButton, List, MenuItem, Fade } from '@material-ui/core'
import { makeStyles, createStyles, Theme, ThemeProvider } from '@material-ui/core/styles'

import AddCircleIcon from '@material-ui/icons/AddCircle'
import AddIcon from '@material-ui/icons/Add'
import MoreVertOutlinedIcon from '@material-ui/icons/MoreVertOutlined'
import HistoryIcon from '@material-ui/icons/History'

import { WalletItem } from '../DashboardComponents/WalletItem'
import { TokenListItem } from '../DashboardComponents/TokenListItem'
import { useModal, useSnackbarCallback } from '../Dialogs/Base'
import {
    DashboardWalletImportDialog,
    DashboardWalletCreateDialog,
    DashboardWalletAddTokenDialog,
    DashboardWalletHistoryDialog,
    DashboardWalletBackupDialog,
    DashboardWalletDeleteConfirmDialog,
    DashboardWalletRenameDialog,
    DashboardWalletErrorDialog,
} from '../Dialogs/Wallet'
import DashboardMenu from '../DashboardComponents/DashboardMenu'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useColorStyles } from '../../../utils/theme'
import Services from '../../service'
import { merge, cloneDeep } from 'lodash-es'
import BigNumber from 'bignumber.js'
import { sleep } from '../../../utils/utils'
import { ETH_ADDRESS, isDAI } from '../../../plugins/Wallet/token'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import { currentEthereumNetworkSettings } from '../../../settings/settings'
import { useWallet } from '../../../plugins/shared/useWallet'
import type { WalletDetails, ERC20TokenDetails } from '../../background-script/PluginService'

const useWalletContentStyles = makeStyles((theme) =>
    createStyles({
        root: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        },
        title: {
            color: theme.palette.text.primary,
            flex: 1,
        },
        addButton: {
            color: theme.palette.primary.main,
        },
        moreButton: {
            color: theme.palette.text.primary,
        },
        tokenList: {
            flex: 1,
            overflow: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        footer: {
            flex: 0,
            margin: theme.spacing(1),
        },
    }),
)

const walletTheme = (theme: Theme): Theme =>
    merge(cloneDeep(theme), {
        overrides: {
            MuiIconButton: {
                root: {
                    color: theme.palette.text,
                },
            },
            MuiList: {
                root: {
                    margin: theme.spacing(0, 3),
                },
            },
            MuiListItemIcon: {
                root: {
                    justifyContent: 'center',
                    minWidth: 'unset',
                    marginRight: theme.spacing(2),
                },
            },
            MuiListItemSecondaryAction: {
                root: {
                    ...theme.typography.body1,
                },
            },
        },
    })

interface WalletContentProps {
    wallet: WalletDetails
    tokens?: ERC20TokenDetails[]
}

const WalletContent = React.forwardRef<HTMLDivElement, WalletContentProps>(function WalletContent(
    { wallet, tokens }: WalletContentProps,
    ref,
) {
    const classes = useWalletContentStyles()
    const { t } = useI18N()
    const color = useColorStyles()

    const network = useValueRef(currentEthereumNetworkSettings)
    const [addToken, , openAddToken] = useModal(DashboardWalletAddTokenDialog)
    const [walletHistory, , openWalletHistory] = useModal(DashboardWalletHistoryDialog)
    const [walletBackup, , openWalletBackup] = useModal(DashboardWalletBackupDialog)
    const [walletDelete, , openWalletDelete] = useModal(DashboardWalletDeleteConfirmDialog)
    const [walletRename, , openWalletRename] = useModal(DashboardWalletRenameDialog)

    const setAsDefault = useSnackbarCallback(
        () => Services.Plugin.invokePlugin('maskbook.wallet', 'setDefaultWallet', wallet!.walletAddress),
        [wallet?.walletAddress],
    )

    const backupMenuItem =
        wallet.type === 'managed' ? (
            <MenuItem onClick={() => openWalletBackup({ wallet: wallet })}>{t('backup')}</MenuItem>
        ) : (
            undefined!
        )
    const deleteMenuItem =
        wallet.type === 'managed' ? (
            <MenuItem
                onClick={() => openWalletDelete({ wallet: wallet })}
                className={color.error}
                data-testid="delete_button">
                {t('delete')}
            </MenuItem>
        ) : (
            undefined!
        )
    const menus = useMemo(
        () =>
            [
                <MenuItem onClick={setAsDefault}>{t('set_as_default')}</MenuItem>,
                <MenuItem onClick={() => openWalletRename({ wallet: wallet })}>{t('rename')}</MenuItem>,
                backupMenuItem,
                deleteMenuItem,
            ].filter((x) => x),
        [setAsDefault, t, backupMenuItem, deleteMenuItem, openWalletRename, wallet],
    )
    const [menu, , openMenu] = useModal(DashboardMenu, { menus })
    if (!wallet) return null
    return (
        <div className={classes.root} ref={ref}>
            <ThemeProvider theme={walletTheme}>
                <Box pt={3} pb={2} pl={3} pr={2} display="flex" alignItems="center">
                    <Typography className={classes.title} variant="h5">
                        {t('details')}
                    </Typography>
                    <Button
                        className={classes.addButton}
                        variant="text"
                        color="primary"
                        onClick={() => openAddToken({ wallet })}
                        startIcon={<AddIcon />}>
                        {t('add_token')}
                    </Button>
                    <IconButton
                        className={classes.moreButton}
                        size="small"
                        onClick={(e) => openMenu({ anchorEl: e.currentTarget })}
                        data-testid="setting_icon">
                        <MoreVertOutlinedIcon />
                    </IconButton>
                    {menu}
                </Box>
                <List className={classes.tokenList} disablePadding>
                    <TokenListItem
                        balance={wallet.ethBalance ?? new BigNumber(0)}
                        wallet={wallet}
                        token={{
                            address: ETH_ADDRESS,
                            name: 'Ether',
                            symbol: 'ETH',
                            network,
                            decimals: 18,
                        }}
                    />
                    {tokens?.map((token) => (
                        <TokenListItem
                            key={token.address}
                            balance={wallet.erc20tokensBalanceMap.get(token.address) ?? new BigNumber(0)}
                            wallet={wallet}
                            token={token}
                        />
                    ))}
                </List>
            </ThemeProvider>
            {wallet.type === 'managed' ? (
                <div className={classes.footer}>
                    <Button
                        onClick={() => openWalletHistory({ wallet: wallet })}
                        startIcon={<HistoryIcon />}
                        variant="text"
                        color="primary">
                        {t('history')}
                    </Button>
                </div>
            ) : null}
            {addToken}
            {walletHistory}
            {walletBackup}
            {walletDelete}
            {walletRename}
        </div>
    )
})

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            display: 'flex',
            flex: '0 0 100%',
            height: '100%',
        },
        scroller: {
            width: 224,
            height: '100%',
            flex: '0 0 auto',
            borderRight: `1px solid ${theme.palette.divider}`,
            overflowY: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
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
    }),
)

export default function DashboardWalletsRouter() {
    const classes = useStyles()
    const { t } = useI18N()
    const { error } = useQueryParams(['error'])

    const [walletImport, openWalletImport] = useModal(DashboardWalletImportDialog)
    const [walletCreate, openWalletCreate] = useModal(DashboardWalletCreateDialog)
    const [walletError, openWalletError] = useModal(DashboardWalletErrorDialog)

    const { data: walletData } = useWallet()
    const { wallets, tokens } = walletData ?? {}
    const [current, setCurrent] = useState('')
    const currentWallet = wallets?.find((wallet) => wallet.walletAddress === current)

    const network = useValueRef(currentEthereumNetworkSettings)

    console.log(`DEBUE: tokens`)
    console.log(tokens)
    console.log(wallets)

    const getTokensForWallet = (wallet?: WalletDetails) => {
        if (!wallet) return []
        return (tokens ?? [])
            .filter((token) => token.network === network && wallet.erc20tokensBalanceMap.has(token.address))
            .sort((token, otherToken) => {
                if (isDAI(token.address)) return -1
                if (isDAI(otherToken.address)) return 1
                return token.name < otherToken.name ? -1 : 1
            })
    }

    // tracking wallet balance
    useEffect(() => {
        Services.Plugin.invokePlugin('maskbook.wallet', 'trackWalletBalances', current)
    }, [current])

    // auto select first wallet
    useEffect(() => {
        if (current) return
        const first = wallets?.[0]?.walletAddress
        if (first) setCurrent(first)
    }, [current, wallets])

    // show error dialog
    useEffect(() => {
        if (error) openWalletError()
    }, [error, openWalletError])

    return (
        <DashboardRouterContainer
            padded={false}
            empty={!wallets?.length}
            title={t('my_wallets')}
            actions={[
                <Button color="primary" variant="outlined" onClick={openWalletImport}>
                    {t('import')}
                </Button>,
                <Button
                    color="primary"
                    variant="contained"
                    onClick={openWalletCreate}
                    endIcon={<AddCircleIcon />}
                    data-testid="create_button">
                    {t('create_wallet')}
                </Button>,
            ]}>
            <div className={classes.root}>
                {wallets?.length ? (
                    <div className={classes.scroller}>
                        {wallets.map((wallet) => (
                            <WalletItem
                                key={wallet.walletAddress}
                                onClick={async () => {
                                    setCurrent('an_adsent_wallet_address')
                                    // for animation purpose
                                    await sleep(100)
                                    setCurrent(wallet.walletAddress)
                                }}
                                wallet={wallet}
                                tokens={getTokensForWallet(wallet)}
                                selected={wallet.walletAddress === current}
                            />
                        ))}
                    </div>
                ) : null}
                <div className={classes.content}>
                    <Fade in={Boolean(current)}>
                        <div className={classes.wrapper}>
                            {currentWallet && (
                                <WalletContent wallet={currentWallet} tokens={getTokensForWallet(currentWallet)} />
                            )}
                        </div>
                    </Fade>
                </div>
            </div>
            {walletImport}
            {walletCreate}
            {walletError}
        </DashboardRouterContainer>
    )
}
