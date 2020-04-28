import React, { useMemo, useState } from 'react'
import DashboardRouterContainer from './Container'
import { Button, Typography, Box, IconButton, List } from '@material-ui/core'
import { makeStyles, createStyles, Theme, ThemeProvider } from '@material-ui/core/styles'

import AddCircleIcon from '@material-ui/icons/AddCircle'
import MoreVertOutlinedIcon from '@material-ui/icons/MoreVertOutlined'
import HistoryIcon from '@material-ui/icons/History'

import { WalletItem } from '../DashboardComponents/WalletItem'
import { WalletRecord } from '../../../plugins/Wallet/database/types'
import { TokenListItem } from '../DashboardComponents/TokenListItem'
import { useModal } from '../Dialog/Base'
import {
    DashboardWalletImportDialog,
    DashboardWalletCreateDialog,
    DashboardWalletAddTokenDialog,
    DashboardWalletHistoryDialog,
} from '../Dialog/Wallet'

const useStyles = makeStyles((theme) =>
    createStyles({
        wrapper: {
            display: 'flex',
            flex: 1,
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

const fakeWallet = {
    name: 'Wallet A',
    address: '0x668281324fd6cB5F205F0764D114D6681A8AC6d1',
}

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
    const [walletImport, openWalletImport] = useModal(DashboardWalletImportDialog)
    const [walletCreate, openWalletCreate] = useModal(DashboardWalletCreateDialog)
    const [addToken, openAddToken] = useModal(DashboardWalletAddTokenDialog)
    const [walletHistory, oepnWalletHistory] = useModal(DashboardWalletHistoryDialog)

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
    const classes = useStyles()
    const wallets: Partial<WalletRecord>[] = [fakeWallet, fakeWallet]
    const [current, setCurrent] = useState(0)

    return (
        <ThemeProvider theme={walletTheme}>
            <DashboardRouterContainer padded={false} title="My Wallets" actions={actions}>
                <div className={classes.wrapper}>
                    <div className={classes.list}>
                        {wallets.map((wallet, index) => (
                            <WalletItem
                                onClick={() => setCurrent(index)}
                                wallet={wallet}
                                selected={index === current}></WalletItem>
                        ))}
                    </div>
                    <div className={classes.content}>
                        <Box pt={3} pb={2} pl={3} pr={2} display="flex" alignItems="center">
                            <Typography className={classes.title} variant="h5">
                                Details
                            </Typography>
                            <Button variant="text" color="primary" onClick={openAddToken} startIcon={<AddCircleIcon />}>
                                Add Token
                            </Button>
                            <IconButton>
                                <MoreVertOutlinedIcon />
                            </IconButton>
                        </Box>
                        <List className={classes.tokenList} disablePadding>
                            <TokenListItem></TokenListItem>
                            <TokenListItem></TokenListItem>
                            <TokenListItem></TokenListItem>
                        </List>
                        <div className={classes.footer}>
                            <Button
                                onClick={oepnWalletHistory}
                                startIcon={<HistoryIcon />}
                                variant="text"
                                color="primary">
                                History
                            </Button>
                        </div>
                    </div>
                </div>
                {walletImport}
                {walletCreate}
                {addToken}
                {walletHistory}
            </DashboardRouterContainer>
        </ThemeProvider>
    )
}
