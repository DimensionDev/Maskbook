import React from 'react'

import { makeStyles, createStyles } from '@material-ui/styles'
import { Theme, Typography, Card, Container, Button } from '@material-ui/core'
import { useRouteMatch, Redirect } from 'react-router-dom'
import { DialogRouter } from './DashboardDialogs/DialogBase'

import FooterLine from './DashboardComponents/FooterLine'
import WalletCard from './DashboardComponents/WalletCard'
import Services from '../service'
import { WalletRecord } from '../../database/Plugins/Wallet/types'
import { useState, useEffect } from 'react'
import { PluginMessageCenter } from '../../plugins/PluginMessages'
import { WalletRedPacketDetailDialogWithRouter } from './DashboardDialogs/Wallet'

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

export default function DashboardWalletsPage() {
    const [wallets, setWallets] = useState<WalletRecord[]>([])
    useEffect(() => {
        PluginMessageCenter.on('maskbook.wallets.update', async () => {
            setWallets(await Services.Plugin.invokePlugin('maskbook.wallet', 'getWallets'))
        })
        Services.Plugin.invokePlugin('maskbook.wallet', 'getWallets').then(setWallets)
    }, [])
    const classes = useStyles()
    // const personas = useMyPersonas()
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
                            <WalletCard wallet={i} />
                        </Card>
                    ))}
                </div>
            </section>
            <section className={classes.sections}>
                <Button
                    onClick={() => {
                        // TODO: private key is E989CF09DD7A1BE2BBEDDBEE1FDCCD55A3E0BBCA938AA9E241F86B8177D6664C
                        Services.Plugin.invokePlugin('maskbook.wallet', 'importNewWallet', {
                            mnemonic: prompt(
                                "What's your wallet mnemonic word? Paste it here, split by space",
                                'flag wave term illness equal airport hint item dinosaur opinion special kick',
                            )!.split(' '),
                            passphrase: prompt('What is password of this wallet?', '12345678'),
                            name: prompt('What is the name of this wallet?', 'Demo wallet'),
                        } as Pick<WalletRecord, 'name' | 'mnemonic' | 'passphrase'>)
                    }}>
                    Import a wallet
                </Button>
            </section>
            <section className={classes.sections}>
                <FooterLine />
            </section>
            <DialogRouter
                path="/redpacket"
                onExit="/wallets/"
                children={<WalletRedPacketDetailDialogWithRouter onDecline="/wallets/" />}
            />
            {!match?.url.endsWith('/') && match?.isExact && <Redirect to={match?.url + '/'} />}
        </Container>
    )
}
