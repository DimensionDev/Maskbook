import { useMemo } from 'react'
import DashboardRouterContainer from './Container'
import { Button, ThemeProvider } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import AddIcon from '@material-ui/icons/Add'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import RestoreIcon from '@material-ui/icons/Restore'
import { useI18N, extendsTheme } from '../../../utils'
import PersonaCard from '../DashboardComponents/PersonaCard'
import { DashboardPersonaCreateDialog, DashboardImportPersonaDialog } from '../DashboardDialogs/Persona'
import { useModal } from '../DashboardDialogs/Base'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'

const useStyles = makeStyles()((theme) => ({
    container: {
        alignItems: 'baseline',
        padding: theme.spacing(3, 0),
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    personaList: {
        margin: 0,
        padding: 0,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridGap: theme.spacing(3),
        [theme.breakpoints.down('sm')]: {
            display: 'block',
        },
    },
    personaItem: {
        listStyle: 'none',
        [theme.breakpoints.down('sm')]: {
            marginBottom: theme.spacing(2),
        },
    },
    databaseButton: {
        paddingTop: 0,
        paddingBottom: 0,
        lineHeight: '24px',
    },
    placeholder: {
        flex: 1,
    },
}))

const personasTheme = extendsTheme((theme) => ({
    components: {
        MuiIconButton: {
            styleOverrides: {
                root: {
                    color: theme.palette.text.primary,
                },
            },
        },
    },
}))

export default function DashboardPersonasRouter() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const personas = useMyPersonas()

    const [createPersona, openCreatePersona] = useModal(DashboardPersonaCreateDialog)
    const [importPersona, openImportPersona] = useModal(DashboardImportPersonaDialog)

    const actions = useMemo(
        () => [
            <Button sx={{ marginRight: 1 }} variant="outlined" onClick={openImportPersona}>
                {t('import')}
            </Button>,
            <Button
                variant="contained"
                onClick={openCreatePersona}
                endIcon={<AddCircleIcon />}
                data-testid="create_button">
                {t('create_persona')}
            </Button>,
        ],
        [t, openCreatePersona, openImportPersona],
    )

    return (
        <DashboardRouterContainer
            title={t('my_personas')}
            empty={!personas.length}
            actions={actions}
            floatingButtons={[
                {
                    icon: <AddIcon />,
                    handler: openCreatePersona,
                },
                {
                    icon: <RestoreIcon />,
                    handler: openImportPersona,
                },
            ]}>
            <ThemeProvider theme={personasTheme}>
                <section className={classes.container}>
                    <ul className={classes.personaList}>
                        {personas
                            .sort((a, b) => {
                                if (a.updatedAt > b.updatedAt) return -1
                                if (a.updatedAt < b.updatedAt) return 1
                                return 0
                            })
                            .map((persona) => (
                                <li key={persona.identifier.toText()} className={classes.personaItem}>
                                    <PersonaCard persona={persona} />
                                </li>
                            ))}
                    </ul>
                </section>
            </ThemeProvider>
            {createPersona}
            {importPersona}
        </DashboardRouterContainer>
    )
}
