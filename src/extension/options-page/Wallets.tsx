import React from 'react'

import { makeStyles, createStyles } from '@material-ui/styles'
import {
    Theme,
    Typography,
    Card,
    Container,
    Button,
    List,
    ListItemText,
    ListItemSecondaryAction,
    ListItem,
    Divider,
} from '@material-ui/core'
import { useRouteMatch, Redirect, Link } from 'react-router-dom'
import { DialogRouter } from './DashboardDialogs/DialogBase'

import FooterLine from './DashboardComponents/FooterLine'
import WalletCard from './DashboardComponents/WalletCard'
import Services from '../service'
import { WalletRecord, ERC20TokenRecord } from '../../database/Plugins/Wallet/types'
import { useState, useEffect } from 'react'
import { PluginMessageCenter } from '../../plugins/PluginMessages'
import {
    WalletRedPacketDetailDialogWithRouter,
    WalletCreateDialog,
    WalletImportDialog,
    WalletErrorDialog,
} from './DashboardDialogs/Wallet'
import { geti18nString } from '../../utils/i18n'
import ActionButton from './DashboardComponents/ActionButton'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        sections: {
            width: '100%',
            marginTop: theme.spacing(2),
        },
        title: {
            marginTop: theme.spacing(3),
            marginBottom: theme.spacing(1),
        },
        button: {
            width: 120,
        },
        secondaryAction: {
            paddingRight: 120,
        },
        actionButtons: {
            margin: theme.spacing(2),
        },
        loaderWrapper: {
            position: 'relative',
            '&:not(:last-child)': {
                marginBottom: theme.spacing(2),
            },
        },
        loader: {
            width: '100%',
            bottom: 0,
            position: 'absolute',
        },
        identity: {
            '&:not(:first-child)': {
                marginTop: theme.spacing(2),
            },
        },
    }),
)

const ListItemWithAction: typeof ListItem = (props: any) => {
    const { classes, ...p } = props
    const { secondaryAction } = useStyles()
    return <ListItem classes={{ secondaryAction, ...classes }} {...p} />
}

const dialogs = (
    <>
        <DialogRouter path="/create" children={<WalletCreateDialog />} />
        <DialogRouter path="/import" children={<WalletImportDialog />} />
        <DialogRouter path="/error" children={<WalletErrorDialog />} />
        <DialogRouter
            path="/redpacket"
            onExit="/wallets/"
            children={<WalletRedPacketDetailDialogWithRouter onDecline="/wallets/" />}
        />
    </>
)

export default function DashboardWalletsPage() {
    const [wallets, setWallets] = useState<WalletRecord[]>([])
    const [tokens, setTokens] = useState<ERC20TokenRecord[]>([])
    useEffect(() => {
        const query = () =>
            Services.Plugin.invokePlugin('maskbook.wallet', 'getWallets').then(x => {
                setWallets(x[0])
                setTokens(x[1])
            })
        query()
        return PluginMessageCenter.on('maskbook.wallets.update', query)
    }, [])
    const classes = useStyles()
    const match = useRouteMatch()!

    return (
        <Container maxWidth="md">
            <section className={classes.sections}>
                <Typography className={classes.title} variant="h5" align="left">
                    My Wallets
                </Typography>
                <div>
                    {wallets.map(i => (
                        <Card key={i.address} className={classes.identity} raised elevation={1}>
                            <WalletCard tokens={tokens} wallet={i} />
                        </Card>
                    ))}
                </div>
            </section>
            <section className={classes.sections}>
                <Typography className={classes.title} variant="h5" align="left">
                    Add Wallet
                </Typography>
                <Card raised elevation={1}>
                    <List disablePadding>
                        <ListItemWithAction key="wallet-create">
                            <ListItemText primary={geti18nString('create')} secondary={'Create a new wallet.'} />
                            <ListItemSecondaryAction>
                                <ActionButton<typeof Link>
                                    variant="contained"
                                    color="primary"
                                    className={classes.button}
                                    component={Link}
                                    to="create/">
                                    {geti18nString('create')}
                                </ActionButton>
                            </ListItemSecondaryAction>
                        </ListItemWithAction>
                        <Divider></Divider>
                        <ListItemWithAction key="dashboard-restore">
                            <ListItemText
                                primary={geti18nString('import')}
                                secondary={'From a previous wallet backup.'}
                            />
                            <ListItemSecondaryAction>
                                <ActionButton<typeof Link>
                                    variant="outlined"
                                    color="default"
                                    className={classes.button}
                                    component={Link}
                                    to="import/">
                                    {geti18nString('import')}
                                </ActionButton>
                            </ListItemSecondaryAction>
                        </ListItemWithAction>
                    </List>
                </Card>
            </section>
            <section className={classes.sections}>
                <FooterLine />
            </section>
            {dialogs}
            {!match?.url.endsWith('/') && match?.isExact && <Redirect to={match?.url + '/'} />}
        </Container>
    )
}
