import React, { useMemo, useState } from 'react'
import DashboardRouterContainer from './Container'
import { Button, Typography, Box, IconButton, List, MenuItem } from '@material-ui/core'
import { makeStyles, createStyles, Theme, ThemeProvider } from '@material-ui/core/styles'

import AddCircleIcon from '@material-ui/icons/AddCircle'
import MoreVertOutlinedIcon from '@material-ui/icons/MoreVertOutlined'
import HistoryIcon from '@material-ui/icons/History'

import { WalletItem } from '../DashboardComponents/WalletItem'
import { TokenListItem } from '../DashboardComponents/TokenListItem'
import { useModal, useSnackbarCallback } from '../Dialog/Base'
import {
    DashboardWalletImportDialog,
    DashboardWalletCreateDialog,
    DashboardWalletAddTokenDialog,
    DashboardWalletHistoryDialog,
    DashboardWalletBackupDialog,
    DashboardWalletDeleteConfirmDialog,
    DashboardWalletRenameDialog,
} from '../Dialog/Wallet'
import { useMyWallets } from '../../../components/DataSource/independent'
import DashboardMenu from '../DashboardComponents/DashboardMenu'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useColorProvider } from '../../../utils/theme'
import Services from '../../service'

const useStyles = makeStyles((theme) =>
    createStyles({
        wrapper: {
            display: 'flex',
            flex: '0 0 100%',
            height: '100%',
        },
        list: {
            width: '251px',
            flex: '0 0 auto',
            height: '100%',
            overflow: 'auto',
            borderRight: `1px solid ${theme.palette.divider}`,
        },
        content: {
            width: '100%',
            overflow: 'auto',
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
        },
        title: {
            flex: 1,
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

const walletTheme = (theme: Theme): Theme => ({
    ...theme,
    overrides: {
        ...theme.overrides,
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

export default function DashboardWalletsRouter() {
    const classes = useStyles()
    const color = useColorProvider()
    const { t } = useI18N()

    const [walletImport, openWalletImport] = useModal(DashboardWalletImportDialog)
    const [walletCreate, openWalletCreate] = useModal(DashboardWalletCreateDialog)
    const [addToken, , openAddToken] = useModal(DashboardWalletAddTokenDialog)
    const [walletHistory, oepnWalletHistory] = useModal(DashboardWalletHistoryDialog)
    const [walletBackup, , oepnWalletBackup] = useModal(DashboardWalletBackupDialog)
    const [walletDelete, , oepnWalletDelete] = useModal(DashboardWalletDeleteConfirmDialog)
    const [walletRename, , oepnWalletRename] = useModal(DashboardWalletRenameDialog)

    const actions = useMemo(
        () => [
            <Button color="primary" variant="outlined" onClick={openWalletImport}>
                Import
            </Button>,
            <Button color="primary" variant="contained" onClick={openWalletCreate} endIcon={<AddCircleIcon />}>
                Create Wallet
            </Button>,
        ],
        [openWalletCreate, openWalletImport],
    )

    const [wallets, tokens] = useMyWallets()
    const [current, setCurrent] = useState(() => wallets[0]?.address ?? '')
    const wallet = wallets.find((i) => i.address === current)
    const setAsDefault = useSnackbarCallback(
        () => Services.Plugin.invokePlugin('maskbook.wallet', 'setDefaultWallet', wallet!.address),
        [wallet?.address],
    )

    const menus = useMemo(
        () => [
            <MenuItem onClick={setAsDefault}>{t('set_as_default')}</MenuItem>,
            <MenuItem onClick={() => oepnWalletRename({ wallet })}>{t('rename')}</MenuItem>,
            <MenuItem onClick={() => oepnWalletBackup({ wallet })}>{t('dashboard_create_backup')}</MenuItem>,
            <MenuItem onClick={() => oepnWalletDelete({ wallet })} className={color.error}>
                {t('dashboard_delete_persona')}
            </MenuItem>,
        ],
        [wallet?.address],
    )

    const [menu, , openMenu] = useModal(DashboardMenu, { menus })

    return (
        <DashboardRouterContainer padded={false} title="My Wallets" actions={actions}>
            <div className={classes.wrapper}>
                <div className={classes.list}>
                    {wallets.map((wallet) => (
                        <WalletItem
                            key={wallet.address}
                            onClick={() => setCurrent(wallet.address)}
                            wallet={wallet}
                            selected={wallet.address === current}></WalletItem>
                    ))}
                </div>
                <div className={classes.content}>
                    <Box pt={3} pb={2} pl={3} pr={2} display="flex" alignItems="center">
                        <Typography className={classes.title} variant="h5">
                            Details
                        </Typography>
                        <Button
                            variant="text"
                            color="primary"
                            onClick={() => openAddToken({ wallet })}
                            startIcon={<AddCircleIcon />}>
                            Add Token
                        </Button>
                        <IconButton onClick={(e) => openMenu({ anchorEl: e.currentTarget })}>
                            <MoreVertOutlinedIcon />
                        </IconButton>
                        {menu}
                    </Box>
                    <ThemeProvider theme={walletTheme}>
                        <List className={classes.tokenList} disablePadding>
                            {tokens.map((token) => (
                                <TokenListItem token={token} key={token.address} />
                            ))}
                        </List>
                    </ThemeProvider>
                    <div className={classes.footer}>
                        <Button onClick={oepnWalletHistory} startIcon={<HistoryIcon />} variant="text" color="primary">
                            History
                        </Button>
                    </div>
                </div>
            </div>
            {walletBackup}
            {walletDelete}
            {walletImport}
            {walletCreate}
            {walletRename}
            {addToken}
            {walletHistory}
        </DashboardRouterContainer>
    )
}
