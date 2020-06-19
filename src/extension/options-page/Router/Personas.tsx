import React, { useMemo } from 'react'
import DashboardRouterContainer from './Container'
import { Button, makeStyles, createStyles, Theme, ThemeProvider } from '@material-ui/core'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import PersonaCard from '../DashboardComponents/PersonaCard'
import { DashboardPersonaCreateDialog, DashboardPersonaImportDialog } from '../Dialog/Persona'
import { useModal } from '../Dialog/Base'
import { Database as DatabaseIcon } from 'react-feather'
import { DashboardDatabaseBackupDialog, DashboardDatabaseRestoreDialog } from '../Dialog/Database'
import SpacedButtonGroup from '../DashboardComponents/SpacedButtonGroup'
import { useI18N } from '../../../utils/i18n-next-ui'
import { merge, cloneDeep } from 'lodash-es'
import { useMyPersonas } from '../../../components/DataSource/independent'

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
        },
        databaseButton: {
            paddingTop: 0,
            paddingBottom: 0,
            lineHeight: '24px',
        },
        placeholder: {
            flex: 1,
        },
        footer: {
            padding: theme.spacing(2, 0),
        },
    }),
)

const personasTheme = (theme: Theme): Theme =>
    merge(cloneDeep(theme), {
        overrides: {
            MuiIconButton: {
                root: {
                    color: theme.palette.text,
                },
            },
        },
    })

export default function DashboardPersonasRouter() {
    const { t } = useI18N()
    const classes = useStyles()
    const personas = useMyPersonas()

    const [createPersona, openCreatePersona] = useModal(DashboardPersonaCreateDialog)
    const [importPersona, openImportPersona] = useModal(DashboardPersonaImportDialog)
    const [backupDatabase, openBackupDatabase] = useModal(DashboardDatabaseBackupDialog)
    const [restoreDatabase, openRestoreDatabase] = useModal(DashboardDatabaseRestoreDialog)

    const actions = useMemo(
        () => [
            <Button color="primary" variant="outlined" onClick={openImportPersona}>
                {t('import')}
            </Button>,
            <Button color="primary" variant="contained" onClick={openCreatePersona} endIcon={<AddCircleIcon />}>
                {t('create_persona')}
            </Button>,
        ],
        [t, openCreatePersona, openImportPersona],
    )

    return (
        <DashboardRouterContainer title={t('my_personas')} actions={actions}>
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
                <div className={classes.placeholder}></div>
                <SpacedButtonGroup className={classes.footer}>
                    <Button
                        className={classes.databaseButton}
                        onClick={openRestoreDatabase}
                        startIcon={<DatabaseIcon size={18} />}
                        color="primary"
                        variant="text">
                        {t('restore_database')}
                    </Button>
                    <Button
                        className={classes.databaseButton}
                        onClick={openBackupDatabase}
                        color="primary"
                        variant="text">
                        {t('backup_database')}
                    </Button>
                </SpacedButtonGroup>
                {createPersona}
                {importPersona}
                {backupDatabase}
                {restoreDatabase}
            </ThemeProvider>
        </DashboardRouterContainer>
    )
}
