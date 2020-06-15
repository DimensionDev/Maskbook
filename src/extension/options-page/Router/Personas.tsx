import React, { useMemo } from 'react'
import DashboardRouterContainer from './Container'
import { Button, makeStyles, createStyles } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import { useMyPersonas } from '../../../components/DataSource/useActivatedUI'
import PersonaCard from '../DashboardComponents/PersonaCard'
import { DashboardPersonaDialog } from '../Dialog/Persona'
import { useDialog } from '../Dialog/Base'

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
    const personas = useMyPersonas()

    const [createPersona, openCreatePersona] = useDialog(<DashboardPersonaDialog />)

    const actions = useMemo(
        () => [
            <Button color="primary" variant="outlined" onClick={() => openCreatePersona()}>
                Restore
            </Button>,
            <Button color="primary" variant="outlined">
                Backup
            </Button>,
            <Button color="primary" variant="contained" endIcon={<AddIcon />}>
                New Persona
            </Button>,
        ],
        [openCreatePersona],
    )

    return (
        <DashboardRouterContainer title="My Personas" actions={actions}>
            <section className={classes.container}>
                {personas.map((persona) => (
                    <PersonaCard key={persona.identifier.toText()} persona={persona} />
                ))}
            </section>
            {createPersona}
        </DashboardRouterContainer>
    )
}
