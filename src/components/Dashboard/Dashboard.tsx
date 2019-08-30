import * as React from 'react'
import Identity from './Identity'
import { Typography, Button, Theme, useTheme } from '@material-ui/core'
import { styled } from '@material-ui/styles'
import { Person } from '../../database'
import { PersonIdentifier } from '../../database/type'

interface Props {
    identities: Person[]
    addAccount(): void
    exportBackup(): void
    onProfileClick(identifier: PersonIdentifier): void
}

const Main = styled('div')(({ theme }: { theme: Theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    background: theme.palette.background.default,
    padding: theme.spacing(4),
    paddingBottom: 0,
    '& > *': {
        marginBottom: theme.spacing(4),
    },
    '& button': {
        minWidth: 220,
        marginBottom: theme.spacing(2),
    },
}))
export default function Dashboard(props: Props) {
    return (
        <Main>
            <Typography variant="h5">Maskbook Identity Management</Typography>
            <main>
                {props.identities.map(x => (
                    <Identity
                        key={x.identifier.toText()}
                        person={x}
                        onClick={() => props.onProfileClick(x.identifier)}
                    />
                ))}
            </main>
            <div>
                <Button onClick={props.addAccount} variant="contained" color="primary">
                    Add Account
                </Button>
                <br />
                <Button onClick={props.exportBackup} variant="outlined" color="default">
                    Export Backup Keystore
                </Button>
            </div>
        </Main>
    )
}
