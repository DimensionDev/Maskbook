import React, { useMemo } from 'react'
import DashboardRouterContainer from './Container'
import { Button, makeStyles, createStyles } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import { useMyPersonas } from '../../../components/DataSource/useActivatedUI'
import PersonaCard from '../DashboardComponents/PersonaCard'

const useStyles = makeStyles((theme) =>
    createStyles({
        container: {
            display: 'flex',
            flexWrap: 'wrap',
            margin: theme.spacing(3, 0),
        },
    }),
)

export default function DashboardPersonasRouter() {
    const classes = useStyles()

    const actions = useMemo(
        () => [
            <Button color="primary" variant="outlined">
                Restore
            </Button>,
            <Button color="primary" variant="outlined">
                Backup
            </Button>,
            <Button color="primary" variant="contained" endIcon={<AddIcon />}>
                New Persona
            </Button>,
        ],
        [],
    )

    const personas = useMyPersonas()

    return (
        <DashboardRouterContainer title="My Personas" actions={actions}>
            <section className={classes.container}>
                {personas.map((persona) => (
                    <PersonaCard key={persona.identifier.toText()} persona={persona} />
                ))}
            </section>
        </DashboardRouterContainer>
    )
}
