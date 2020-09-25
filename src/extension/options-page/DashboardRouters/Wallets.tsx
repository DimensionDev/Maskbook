import React, { useState, useEffect, useCallback } from 'react'
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
import { useMenu } from '../../../utils/hooks/useMenu'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useColorStyles } from '../../../utils/theme'
import Services from '../../service'
import { merge, cloneDeep } from 'lodash-es'
import BigNumber from 'bignumber.js'
import { sleep } from '../../../utils/utils'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import type { ERC20TokenDetails } from '../../background-script/PluginService'
import type { RedPacketRecord } from '../../../plugins/RedPacket/types'
import { useHistory } from 'react-router-dom'
import { useMatchXS } from '../../../utils/hooks/useMatchXS'
import { Flags } from '../../../utils/flags'
import { WalletMessageCenter, MaskbookWalletMessages } from '../../../plugins/Wallet/messages'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { ProviderType } from '../../../web3/types'
import { useChainId } from '../../../web3/hooks/useChainId'
import { useWallets, useTokens } from '../../../plugins/Wallet/hooks/useWallet'
import { useConstant } from '../../../web3/hooks/useConstant'
import { isDAI } from '../../../web3/helpers'
import { CONSTANTS } from '../../../web3/constants'
import { useTokensBalance } from '../../../web3/hooks/useTokensBalance'

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
    wallet: WalletRecord
    tokens?: ERC20TokenDetails[]
}

const WalletContent = React.forwardRef<HTMLDivElement, WalletContentProps>(function WalletContent(
    { wallet, tokens }: WalletContentProps,
    ref,
) {
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')
    const classes = useWalletContentStyles()
    const { t } = useI18N()
    const color = useColorStyles()
    const xsMatched = useMatchXS()
    const chainId = useChainId()
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

    const [menu, openMenu] = useMenu(
        <MenuItem onClick={setAsDefault}>{t('set_as_default')}</MenuItem>,
        <MenuItem onClick={() => openWalletShare({ wallet })}>{t('share')}</MenuItem>,
        <MenuItem onClick={() => openWalletRename({ wallet })}>{t('rename')}</MenuItem>,
        wallet.provider === ProviderType.Maskbook ? (
            <MenuItem onClick={() => openWalletBackup({ wallet })}>{t('backup')}</MenuItem>
        ) : undefined,
        <MenuItem onClick={() => openWalletDelete({ wallet })} className={color.error} data-testid="delete_button">
            {t('delete')}
        </MenuItem>,
    )

    // fetch tokens balance
    const { value: listOfBalances = [] } = useTokensBalance(wallet.address, tokens?.map((x) => x.address) ?? [])

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
                        onClick={openMenu}
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
                            chainId,
                            decimals: 18,
                        }}
                    />
                    {tokens?.map((token, idx) => (
                        <TokenListItem
                            key={token.address}
                            balance={
                                new BigNumber(
                                    listOfBalances[idx]
                                        ? listOfBalances[idx]
                                        : wallet.erc20_token_balance.get(token.address) ?? '0',
                                )
                            }
                            wallet={wallet}
                            token={token}
                        />
                    ))}
                </List>
            </ThemeProvider>
            {wallet.provider === ProviderType.Maskbook && !xsMatched ? (
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
    const { create, error, rpid } = useQueryParams(['create', 'error', 'rpid'])
    const xsMatched = useMatchXS()

    const [walletCreate, openWalletCreate] = useModal(DashboardWalletCreateDialog)
    const [walletError, openWalletError] = useModal(DashboardWalletErrorDialog)
    const [addToken, , openAddToken] = useModal(DashboardWalletAddTokenDialog)
    const [walletHistory, , openWalletHistory] = useModal(DashboardWalletHistoryDialog)
    const [walletRedPacketDetail, , openWalletRedPacketDetail] = useModal(DashboardWalletRedPacketDetailDialog)
    const [walletRedPacket, , openWalletRedPacket] = useModal(DashboardWalletRedPacketDetailDialog)

    const chainId = useChainId()
    const wallets = useWallets()
    const tokens = useTokens()
    const [current, setCurrent] = useState('')
    const currentWallet = wallets.find((wallet) => wallet.address === current)

    // tracking wallet balance
    useEffect(() => {
        Services.Plugin.invokePlugin('maskbook.wallet', 'updateWalletBalances', [current])
    }, [current])

    // auto select first wallet
    useEffect(() => {
        if (current) return
        if (xsMatched) return
        const first = wallets?.[0]?.address
        if (first) setCurrent(first)
    }, [xsMatched, current, wallets])

    // show create dialog
    useEffect(() => {
        if (create) openWalletCreate()
    }, [create, openWalletCreate])

    // show error dialog
    useEffect(() => {
        if (error) openWalletError()
    }, [error, openWalletError])

    // show red packet detail dialog
    useEffect(() => {
        if (!rpid) return
        Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPacketByID', rpid).then((redPacket) =>
            openWalletRedPacketDetail({
                redPacket,
            }),
        )
    }, [rpid, openWalletRedPacketDetail])

    // show provider connect dialog
    const [, setOpen] = useRemoteControlledDialog<MaskbookWalletMessages, 'selectProviderDialogUpdated'>(
        WalletMessageCenter,
        'selectProviderDialogUpdated',
    )
    const onConnect = useCallback(() => {
        setOpen({
            open: true,
        })
    }, [setOpen])

    const getTokensForWallet = (wallet?: WalletRecord) => {
        if (!wallet) return []
        return tokens
            .filter(
                (token) =>
                    token.chainId === chainId &&
                    wallet.erc20_token_balance.has(token.address) &&
                    !wallet.erc20_token_blacklist.has(token.address),
            )
            .sort((token, otherToken) => {
                if (isDAI(token.address)) return -1
                if (isDAI(otherToken.address)) return 1
                return token.name < otherToken.name ? -1 : 1
            })
    }
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
                Flags.metamask_support_enabled ? (
                    <Button variant="outlined" onClick={onConnect}>
                        {t('connect')}
                    </Button>
                ) : (
                    <></>
                ),
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
                        if (!currentWallet) return
                        openWalletHistory({
                            wallet: currentWallet,
                            onClickRedPacketRecord: (record: RedPacketRecord) => {
                                openWalletRedPacket({
                                    redPacket: record,
                                })
                            },
                        })
                    }}>
                    <RestoreIcon />
                </IconButton>,
                <IconButton
                    onClick={() => {
                        if (currentWallet) openAddToken({ wallet: currentWallet })
                        else openWalletCreate()
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
            {walletCreate}
            {walletError}
            {walletRedPacket}
            {walletRedPacketDetail}
        </DashboardRouterContainer>
    )
}
