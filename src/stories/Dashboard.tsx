import React from 'react'
import { storiesOf } from '@storybook/react'
import {
    PersonaCreateDialog,
    PersonaCreatedDialog,
    PersonaDeleteDialog,
    PersonaBackupDialog,
    PersonaImportDialog,
    PersonaImportSuccessDialog,
    PersonaImportFailedDialog,
} from '../extension/options-page/DashboardDialogs/Persona'
import { HashRouter as Router } from 'react-router-dom'
import { ThemeProvider, useMediaQuery, Dialog } from '@material-ui/core'
import { MaskbookDarkTheme, MaskbookLightTheme } from '../utils/theme'
import { action } from '@storybook/addon-actions'
import { useCurrentIdentity } from '../components/DataSource/useActivatedUI'
import { apperanceSettings, Apperance } from '../components/shared-settings/settings'
import { useValueRef } from '../utils/hooks/useValueRef'

function DashboardDialog({ children }: { children: React.ReactNode }) {
    const isPerferDark = useMediaQuery('(prefers-color-scheme: dark)')
    const apperance = useValueRef(apperanceSettings)
    return (
        <Router>
            <ThemeProvider
                theme={
                    (isPerferDark && apperance === Apperance.default) || apperance === Apperance.dark
                        ? MaskbookDarkTheme
                        : MaskbookLightTheme
                }>
                <Dialog open>{children}</Dialog>
            </ThemeProvider>
        </Router>
    )
}

storiesOf('Dashboard', module)
    .add('Persona Create Dialog', () => (
        <DashboardDialog>
            <PersonaCreateDialog />
        </DashboardDialog>
    ))
    .add('Persona Created Dialog', () => (
        <DashboardDialog>
            <PersonaCreatedDialog />
        </DashboardDialog>
    ))
    .add('Persona Delete Dialog', () => {
        const currentIdentity = useCurrentIdentity()
        return (
            <DashboardDialog>
                <PersonaDeleteDialog
                    onConfirm={action('confirmed')}
                    onDecline={action('declined')}
                    persona={currentIdentity?.linkedPersona!}
                />
            </DashboardDialog>
        )
    })
    .add('Persona Backup Dialog', () => {
        const currentIdentity = useCurrentIdentity()
        return (
            <DashboardDialog>
                <PersonaBackupDialog onClose={action('close')} persona={currentIdentity?.linkedPersona!} />
            </DashboardDialog>
        )
    })
    .add('Persona Import Dialog', () => (
        <DashboardDialog>
            <PersonaImportDialog />
        </DashboardDialog>
    ))
    .add('Persona Import Success Dialog', () => {
        const currentIdentity = useCurrentIdentity()
        return (
            <DashboardDialog>
                <PersonaImportSuccessDialog
                    nickname={currentIdentity?.nickname!}
                    profiles={1}
                    onConfirm={action('confirmed')}
                />
            </DashboardDialog>
        )
    })
    .add('Persona Import Failed Dialog', () => (
        <DashboardDialog>
            <PersonaImportFailedDialog onConfirm={action('confirmed')} />
        </DashboardDialog>
    ))
