import React, { useMemo, useState, useEffect } from 'react'
import DashboardRouterContainer from './Container'
import { Button, Typography, Box, IconButton, List, MenuItem, Fade, useMediaQuery } from '@material-ui/core'
import { makeStyles, createStyles, Theme, ThemeProvider } from '@material-ui/core/styles'

import AddCircleIcon from '@material-ui/icons/AddCircle'
import AddIcon from '@material-ui/icons/Add'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import RestoreIcon from '@material-ui/icons/Restore'
import MoreVertOutlinedIcon from '@material-ui/icons/MoreVertOutlined'
import HistoryIcon from '@material-ui/icons/History'

import { WalletItem } from '../DashboardComponents/WalletItem'
import { TokenListItem } from '../DashboardComponents/TokenListItem'
import { useModal, useSnackbarCallback } from '../DashboardDialogs/Base'
import {
    DashboardWalletImportDialog,
    DashboardWalletCreateDialog,
    DashboardWalletAddTokenDialog,
    DashboardWalletHistoryDialog,
    DashboardWalletBackupDialog,
    DashboardWalletDeleteConfirmDialog,
    DashboardWalletRenameDialog,
    DashboardWalletErrorDialog,
    DashboardWalletRedPacketDetailDialog,
    DashboardWalletShareDialog,
} from '../DashboardDialogs/Wallet'
import DashboardMenu from '../DashboardComponents/DashboardMenu'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useColorStyles } from '../../../utils/theme'
import Services from '../../service'
import { merge, cloneDeep } from 'lodash-es'
import BigNumber from 'bignumber.js'
import { sleep } from '../../../utils/utils'
import { ETH_ADDRESS, isDAI } from '../../../plugins/Wallet/token'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import { useCurrentEthChain, useTokens, useWallets } from '../../../plugins/shared/useWallet'
import type { WalletDetails, ERC20TokenDetails } from '../../background-script/PluginService'
import type { RedPacketRecord } from '../../../plugins/RedPacket/types'
import { useHistory } from 'react-router-dom'
import { WalletProviderType } from '../../../plugins/shared/findOutProvider'
import { useSnackbar } from 'notistack'
import { useMatchXS } from '../../../utils/hooks/useMatchXS'

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
            margin: theme.spacing(0, 3),
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
    const xsMatched = useMatchXS()
    const network = useCurrentEthChain()
    const [addToken, , openAddToken] = useModal(DashboardWalletAddTokenDialog)
    const [walletShare, , openWalletShare] = useModal(DashboardWalletShareDialog)
    const [walletHistory, , openWalletHistory] = useModal(DashboardWalletHistoryDialog)
    const [walletBackup, , openWalletBackup] = useModal(DashboardWalletBackupDialog)
    const [walletDelete, , openWalletDelete] = useModal(DashboardWalletDeleteConfirmDialog)
    const [walletRename, , openWalletRename] = useModal(DashboardWalletRenameDialog)
    const [walletRedPacket, , openWalletRedPacket] = useModal(DashboardWalletRedPacketDetailDialog)

    const setAsDefault = useSnackbarCallback(
        () => Services.Plugin.invokePlugin('maskbook.wallet', 'setDefaultWallet', wallet!.address),
        [wallet?.address],
    )

    const backupMenuItem =
        wallet.type === 'exotic' ? (
            undefined!
        ) : (
            <MenuItem onClick={() => openWalletBackup({ wallet })}>{t('backup')}</MenuItem>
        )
    const deleteMenuItem = (
        <MenuItem
            onClick={() => openWalletDelete({ wallet: wallet })}
            className={color.error}
            data-testid="delete_button">
            {t('delete')}
        </MenuItem>
    )
    const menus = useMemo(
        () =>
            [
                <MenuItem onClick={setAsDefault}>{t('set_as_default')}</MenuItem>,
                <MenuItem onClick={() => openWalletShare({ wallet: wallet })}>{t('share')}</MenuItem>,
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
                        {xsMatched ? wallet.name ?? wallet.address : t('details')}
                    </Typography>
                    {xsMatched ? null : (
                        <Button
                            className={classes.addButton}
                            variant="text"
                            onClick={() => openAddToken({ wallet })}
                            startIcon={<AddIcon />}>
                            {t('add_token')}
                        </Button>
                    )}
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
                        balance={wallet.eth_balance}
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
                            balance={wallet.erc20_token_balance.get(token.address) ?? new BigNumber(0)}
                            wallet={wallet}
                            token={token}
                        />
                    ))}
                </List>
            </ThemeProvider>
            {wallet.type === 'managed' && !xsMatched ? (
                <div className={classes.footer}>
                    <Button
                        onClick={() =>
                            openWalletHistory({
                                wallet,
                                onClickRedPacketRecord: (record: RedPacketRecord) => {
                                    openWalletRedPacket({
                                        redPacket: record,
                                    })
                                },
                            })
                        }
                        startIcon={<HistoryIcon />}
                        variant="text">
                        {t('activity')}
                    </Button>
                </div>
            ) : null}
            {addToken}
            {walletShare}
            {walletHistory}
            {walletBackup}
            {walletDelete}
            {walletRename}
            {walletRedPacket}
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
            [theme.breakpoints.down('xs')]: {
                width: '100%',
                borderRight: 'none',
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
    const history = useHistory()
    const { error } = useQueryParams(['error'])
    const { rpid } = useQueryParams(['rpid'])
    const xsMatched = useMatchXS()

    const [walletImport, openWalletImport] = useModal(DashboardWalletImportDialog)
    const [walletCreate, openWalletCreate] = useModal(DashboardWalletCreateDialog)
    const [walletError, openWalletError] = useModal(DashboardWalletErrorDialog)
    const [addToken, , openAddToken] = useModal(DashboardWalletAddTokenDialog)
    const [walletHistory, , openWalletHistory] = useModal(DashboardWalletHistoryDialog)
    const [walletRedPacketDetail, , openWalletRedPacketDetail] = useModal(DashboardWalletRedPacketDetailDialog)
    const [walletRedPacket, , openWalletRedPacket] = useModal(DashboardWalletRedPacketDetailDialog)

    const { data: wallets } = useWallets()
    const { data: tokens } = useTokens()
    const [current, setCurrent] = useState('')
    const notify = useSnackbar()
    const currentWallet = wallets?.find((wallet) => wallet.address === current)

    const network = useCurrentEthChain()
    const getTokensForWallet = (wallet?: WalletDetails) => {
        if (!wallet) return []
        return (tokens ?? [])
            .filter(
                (token) =>
                    token.network === network &&
                    wallet.erc20_token_balance.has(token.address) &&
                    !wallet.erc20_token_blacklist.has(token.address),
            )
            .sort((token, otherToken) => {
                if (isDAI(token.address)) return -1
                if (isDAI(otherToken.address)) return 1
                return token.name < otherToken.name ? -1 : 1
            })
    }

    // tracking wallet balance
    useEffect(() => {
        Services.Plugin.invokePlugin('maskbook.wallet', 'watchWalletBalances', current)
        Services.Plugin.invokePlugin('maskbook.wallet', 'updateWalletBalances', [current])
    }, [current])

    // auto select first wallet
    useEffect(() => {
        if (current) return
        if (xsMatched) return
        const first = wallets?.[0]?.address
        if (first) setCurrent(first)
    }, [xsMatched, current, wallets])

    // show error dialog
    useEffect(() => {
        if (error) openWalletError()
    }, [error, openWalletError])

    // show red packet detail dialog
    useEffect(() => {
        if (!rpid) return
        Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPacketByID', undefined, rpid).then((redPacket) =>
            openWalletRedPacketDetail({
                redPacket,
            }),
        )
    }, [rpid, openWalletRedPacketDetail])

    const walletContent = (
        <div className={classes.wrapper}>
            {currentWallet && <WalletContent wallet={currentWallet} tokens={getTokensForWallet(currentWallet)} />}
        </div>
    )

    return (
        <DashboardRouterContainer
            padded={false}
            empty={!wallets?.length}
            title={t('my_wallets')}
            actions={[
                <Button
                    variant="outlined"
                    onClick={async () => {
                        try {
                            await Services.Plugin.connectExoticWallet(WalletProviderType.metamask)
                            notify.enqueueSnackbar('Success', { variant: 'success' })
                        } catch (e) {}
                    }}>
                    {t('import_from_metamask')}
                </Button>,
                <Button variant="outlined" onClick={openWalletImport}>
                    {t('import')}
                </Button>,
                <Button
                    variant="contained"
                    onClick={openWalletCreate}
                    endIcon={<AddCircleIcon />}
                    data-testid="create_button">
                    {t('create_wallet')}
                </Button>,
            ]}
            leftIcons={[
                <IconButton
                    onClick={() => {
                        if (current) setCurrent('')
                        else history.goBack()
                    }}>
                    <ArrowBackIosIcon />
                </IconButton>,
            ]}
            rightIcons={[
                <IconButton
                    onClick={() => {
                        if (currentWallet) {
                            openWalletHistory({
                                wallet: currentWallet,
                                onClickRedPacketRecord: (record: RedPacketRecord) => {
                                    openWalletRedPacket({
                                        redPacket: record,
                                    })
                                },
                            })
                        } else {
                            openWalletImport()
                        }
                    }}>
                    <RestoreIcon />
                </IconButton>,
                <IconButton
                    onClick={() => {
                        if (currentWallet) {
                            openAddToken({ wallet: currentWallet })
                        } else {
                            openWalletCreate()
                        }
                    }}>
                    <AddIcon />
                </IconButton>,
            ]}>
            <div className={classes.root}>
                {wallets?.length && !(xsMatched && current) ? (
                    <div className={classes.scroller}>
                        {wallets.map((wallet) => (
                            <WalletItem
                                key={wallet.address}
                                onClick={async () => {
                                    if (!xsMatched) {
                                        setCurrent('an_adsent_wallet_address')
                                        // for animation purpose
                                        await sleep(100)
                                    }
                                    setCurrent(wallet.address)
                                }}
                                wallet={wallet}
                                tokens={getTokensForWallet(wallet)}
                                selected={wallet.address === current}
                            />
                        ))}
                    </div>
                ) : null}
                <div className={classes.content}>
                    {xsMatched ? walletContent : <Fade in={Boolean(current)}>{walletContent}</Fade>}
                </div>
            </div>
            {addToken}
            {walletHistory}
            {walletImport}
            {walletCreate}
            {walletError}
            {walletRedPacket}
            {walletRedPacketDetail}
        </DashboardRouterContainer>
    )
}
