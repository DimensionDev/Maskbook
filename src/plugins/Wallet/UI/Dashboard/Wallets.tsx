import React from 'react'

import { makeStyles, createStyles } from '@material-ui/styles'
import {
    Theme,
    Typography,
    Card,
    Container,
    List,
    ListItemText,
    ListItemSecondaryAction,
    ListItem,
    Divider,
} from '@material-ui/core'
import { useRouteMatch, Redirect, Link } from 'react-router-dom'
import { DialogRouter } from '../../../../extension/options-page/DashboardDialogs/DialogBase'

import FooterLine from '../../../../extension/options-page/DashboardComponents/FooterLine'
import WalletCard from './Components/WalletCard'
import {
    WalletRedPacketDetailDialogWithRouter,
    WalletCreateDialog,
    WalletImportDialog,
    WalletErrorDialog,
} from './Dialogs/Wallet'
import { useI18N } from '../../../../utils/i18n-next-ui'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { useMyWallets } from '../../../../components/DataSource/independent'

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
            paddingRight: 120 + theme.spacing(2),
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
    const { t } = useI18N()
    const [wallets, tokens] = useMyWallets()
    const classes = useStyles()
    const match = useRouteMatch()!

    return (
        <Container maxWidth="md">
            <section className={classes.sections}>
                <Typography className={classes.title} variant="h5" align="left">
                    My Wallets
                </Typography>
                <div>
                    {wallets.map((wallet) => (
                        <Card key={wallet.address} className={classes.identity} raised elevation={1}>
                            <WalletCard
                                tokens={tokens.filter((token) => wallet.erc20_token_balance.has(token.address))}
                                wallet={wallet}
                            />
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
                            <ListItemText primary={t('create')} secondary={'Create a new wallet.'} />
                            <ListItemSecondaryAction>
                                <ActionButton<typeof Link>
                                    variant="contained"
                                    color="primary"
                                    className={classes.button}
                                    component={Link}
                                    to="create/">
                                    {t('create')}
                                </ActionButton>
                            </ListItemSecondaryAction>
                        </ListItemWithAction>
                        <Divider></Divider>
                        <ListItemWithAction key="dashboard-restore">
                            <ListItemText primary={t('import')} secondary={'From a previous wallet backup.'} />
                            <ListItemSecondaryAction>
                                <ActionButton<typeof Link>
                                    variant="outlined"
                                    color="default"
                                    className={classes.button}
                                    component={Link}
                                    to="import/">
                                    {t('import')}
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
