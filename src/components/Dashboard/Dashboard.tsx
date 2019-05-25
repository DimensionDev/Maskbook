import * as React from 'react'
import Typography from '@material-ui/core/Typography/Typography'
import { createBox } from '../../utils/components/Flex'
import Identity from './Identity'
import Button from '@material-ui/core/Button/Button'
import { Person } from '../../extension/background-script/PeopleService'

interface Props {
    identities: Person[]
    addAccount(): void
    exportBackup(): void
    onProfileClick(username: string): void
}

const Main = createBox(theme => ({
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
                    <Identity key={x.username} person={x} onClick={() => props.onProfileClick(x.username)} />
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
