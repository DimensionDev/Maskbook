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
} from '../Dialogs/Wallet'
import { useMyWallets } from '../../../components/DataSource/independent'
import DashboardMenu from '../DashboardComponents/DashboardMenu'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useColorProvider } from '../../../utils/theme'
import Services from '../../service'
import { merge, cloneDeep } from 'lodash-es'
import BigNumber from 'bignumber.js'
import type { WalletRecord, ERC20TokenRecord } from '../../../plugins/Wallet/database/types'
import { sleep } from '../../../utils/utils'
import { ETH_ADDRESS } from '../../../plugins/Wallet/token'
import { ethereumNetworkSettings } from '../../../plugins/Wallet/network'
import { useValueRef } from '../../../utils/hooks/useValueRef'

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
    wallet: WalletRecord & { privateKey: string }
    tokens: ERC20TokenRecord[]
}

function WalletContent({ wallet, tokens }: WalletContentProps) {
    const classes = useStyles()
    const { t } = useI18N()
    const color = useColorProvider()

    const network = useValueRef(ethereumNetworkSettings)

    const [addToken, , openAddToken] = useModal(DashboardWalletAddTokenDialog)
    const [walletHistory, , oepnWalletHistory] = useModal(DashboardWalletHistoryDialog)

    const [walletBackup, , oepnWalletBackup] = useModal(DashboardWalletBackupDialog)
    const [walletDelete, , oepnWalletDelete] = useModal(DashboardWalletDeleteConfirmDialog)
    const [walletRename, , oepnWalletRename] = useModal(DashboardWalletRenameDialog)

    const currentTokens = tokens.filter((token) => wallet?.erc20_token_balance.has(token.address))
    const setAsDefault = useSnackbarCallback(
        () => Services.Plugin.invokePlugin('maskbook.wallet', 'setDefaultWallet', wallet!.address),
        [wallet?.address],
    )

    const menus = useMemo(
        () => [
            <MenuItem onClick={setAsDefault}>{t('set_as_default')}</MenuItem>,
            <MenuItem onClick={() => oepnWalletRename({ wallet: wallet })}>{t('rename')}</MenuItem>,
            <MenuItem onClick={() => oepnWalletBackup({ wallet: wallet })}>{t('backup')}</MenuItem>,
            <MenuItem onClick={() => oepnWalletDelete({ wallet: wallet })} className={color.error}>
                {t('delete')}
            </MenuItem>,
        ],
        [color.error, wallet, oepnWalletBackup, oepnWalletDelete, oepnWalletRename, setAsDefault, t],
    )
    const [menu, , openMenu] = useModal(DashboardMenu, { menus })

    if (!wallet) return null
    return (
        <>
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
                        onClick={(e) => openMenu({ anchorEl: e.currentTarget })}>
                        <MoreVertOutlinedIcon />
                    </IconButton>
                    {menu}
                </Box>
                <List className={classes.tokenList} disablePadding>
                    <TokenListItem
                        balance={wallet.eth_balance ?? new BigNumber(0)}
                        token={{
                            address: ETH_ADDRESS,
                            name: 'Ether',
                            symbol: 'ETH',
                            network,
                            decimals: 18,
                            is_user_defined: false,
                        }}></TokenListItem>
                    {currentTokens.map((token) => (
                        <TokenListItem
                            balance={wallet.erc20_token_balance.get(token.address) ?? new BigNumber(0)}
                            token={token}
                            key={token.address}
                        />
                    ))}
                </List>
            </ThemeProvider>
            <div className={classes.footer}>
                <Button
                    onClick={() => oepnWalletHistory({ wallet: wallet })}
                    startIcon={<HistoryIcon />}
                    variant="text"
                    color="primary">
                    {t('history')}
                </Button>
            </div>
            {addToken}
            {walletHistory}
            {walletBackup}
            {walletDelete}
            {walletRename}
        </>
    )
}

export default function DashboardWalletsRouter() {
    const classes = useStyles()
    const { t } = useI18N()

    const [walletImport, openWalletImport] = useModal(DashboardWalletImportDialog)
    const [walletCreate, openWalletCreate] = useModal(DashboardWalletCreateDialog)

    const [wallets, tokens] = useMyWallets()
    const [current, setCurrent] = useState('')
    const currentWallet = wallets.find((wallet) => wallet.address === current)

    // auto select first wallet
    useEffect(() => {
        if (current) return
        if (wallets[0]?.address) setCurrent(wallets[0]?.address)
    }, [current, wallets])

    return (
        <DashboardRouterContainer
            padded={false}
            empty={!wallets.length}
            title={t('my_wallets')}
            actions={[
                <Button color="primary" variant="outlined" onClick={openWalletImport}>
                    {t('import')}
                </Button>,
                <Button color="primary" variant="contained" onClick={openWalletCreate} endIcon={<AddCircleIcon />}>
                    {t('create_wallet')}
                </Button>,
            ]}>
            <div className={classes.root}>
                {wallets.length ? (
                    <div className={classes.scroller}>
                        {wallets.map((wallet) => (
                            <WalletItem
                                key={wallet.address}
                                onClick={async () => {
                                    setCurrent('an_adsent_wallet_address')
                                    // for animation purpose
                                    await sleep(100)
                                    setCurrent(wallet.address)
                                }}
                                wallet={wallet}
                                tokens={tokens.filter((token) => wallet.erc20_token_balance.has(token.address))}
                                selected={wallet.address === current}
                            />
                        ))}
                    </div>
                ) : null}
                <div className={classes.content}>
                    <Fade in={Boolean(current)}>
                        {currentWallet ? (
                            <WalletContent wallet={currentWallet} tokens={tokens}></WalletContent>
                        ) : (
                            <div></div>
                        )}
                    </Fade>
                </div>
            </div>
            {walletImport}
            {walletCreate}
        </DashboardRouterContainer>
    )
}
