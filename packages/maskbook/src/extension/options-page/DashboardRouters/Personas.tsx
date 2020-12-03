import { useMemo } from 'react'
import DashboardRouterContainer from './Container'
import { Button, makeStyles, createStyles, ThemeProvider } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import RestoreIcon from '@material-ui/icons/Restore'
import PersonaCard from '../DashboardComponents/PersonaCard'
import { DashboardPersonaCreateDialog, DashboardImportPersonaDialog } from '../DashboardDialogs/Persona'
import { useModal } from '../DashboardDialogs/Base'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import { extendsTheme } from '../../../utils/theme'

const useStyles = makeStyles((theme) =>
    createStyles({
        container: {
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            overflow: 'auto',
            paddingTop: theme.spacing(3),

            // keep the shadow of the persona card
            marginLeft: -4,
            paddingLeft: 4,

            '&::-webkit-scrollbar': {
                display: 'none',
            },
            [theme.breakpoints.down('sm')]: {
                margin: 0,
                paddingLeft: 0,
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
    }),
)

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
    const classes = useStyles()
    const personas = useMyPersonas()

    const [createPersona, openCreatePersona] = useModal(DashboardPersonaCreateDialog)
    const [importPersona, openImportPersona] = useModal(DashboardImportPersonaDialog)

    const actions = useMemo(
        () => [
            <Button variant="outlined" onClick={openImportPersona}>
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
                    {personas
                        .sort((a, b) => {
                            if (a.updatedAt > b.updatedAt) return -1
                            if (a.updatedAt < b.updatedAt) return 1
                            return 0
                        })
                        .map((persona) => (
                            <PersonaCard key={persona.identifier.toText()} persona={persona} />
                        ))}
                </section>
            </ThemeProvider>
            {createPersona}
            {importPersona}
        </DashboardRouterContainer>
    )
}
