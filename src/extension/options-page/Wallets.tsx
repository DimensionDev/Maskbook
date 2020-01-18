import React from 'react'

import { makeStyles, createStyles } from '@material-ui/styles'
import { Theme, Typography, Card, Container } from '@material-ui/core'
import { useHistory, useRouteMatch, Redirect } from 'react-router-dom'
import { DialogRouter } from './DashboardDialogs/DialogBase'

import { DatabaseRestoreDialog } from './DashboardDialogs/Database'
import { PersonaCreateDialog, PersonaCreatedDialog, PersonaImportDialog } from './DashboardDialogs/Persona'
import FooterLine from './DashboardComponents/FooterLine'
import WalletCard from './DashboardComponents/WalletCard'
import PluginRedPacket from '../../components/InjectedComponents/StructuredMessage/RedPacket'
import StructuredPluginWrapper from '../../components/InjectedComponents/StructuredMessage/StructuredPluginWrapper'
import Services from '../service'
import { WalletRecord } from '../../database/Plugins/Wallet/types'
import { useState, useEffect } from 'react'
import { PluginMessageCenter } from '../../plugins/PluginMessages'

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
    useEffect(() =>
        PluginMessageCenter.on('maskbook.wallets.update', async () => {
            setWallets(await Services.Plugin.invokePlugin('maskbook.wallet', 'getWallets'))
        }),
    )
    const classes = useStyles()
    // const personas = useMyPersonas()
    const match = useRouteMatch()!

    const dialogs = (
        <>
            <DialogRouter path="/database/restore" children={<DatabaseRestoreDialog />} />
            <DialogRouter path="/persona/create" children={<PersonaCreateDialog />} />
            <DialogRouter path="/persona/created" children={<PersonaCreatedDialog />} />
            <DialogRouter path="/persona/import" children={<PersonaImportDialog />} />
        </>
    )

    return (
        <Container maxWidth="md">
            <section className={classes.sections}>
                <Typography className={classes.title} variant="h5" align="left">
                    My Wallets
                </Typography>
                <button
                    onClick={() => {
                        Services.Plugin.invokePlugin('maskbook.wallet', 'importNewWallet', {
                            mnemonic: ['random', 'word'],
                            name: 'Wallet ' + Math.random(),
                            passphrase: 'password',
                        } as Pick<WalletRecord, 'name' | 'mnemonic' | 'passphrase'>)
                    }}>
                    Add new random wallet
                </button>
                <div>
                    {wallets.map((i, index) => (
                        <Card key={i.id} className={classes.identity} raised elevation={1}>
                            <WalletCard wallet={i} />
                        </Card>
                    ))}
                </div>
            </section>
            <section className={classes.sections}>
                <StructuredPluginWrapper pluginName="Red Packet">
                    <PluginRedPacket></PluginRedPacket>
                </StructuredPluginWrapper>
                <Typography variant="body2">
                    Every wallet belongs to its corresponding persona. More operations (e.g. delete & export) are
                    available in the persona card at the Home page.
                </Typography>
            </section>
            <section className={classes.sections}>
                <FooterLine />
            </section>
            {dialogs}
            {!match?.url.endsWith('/') && match?.isExact && <Redirect to={match?.url + '/'} />}
        </Container>
    )
}
