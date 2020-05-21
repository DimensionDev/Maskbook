import React from 'react'
import { storiesOf } from '@storybook/react'
import {
    PersonaImportDialog,
    PersonaImportSuccessDialog,
    PersonaImportFailedDialog,
} from '../extension/options-page/DashboardDialogs/Persona'
import { HashRouter as Router } from 'react-router-dom'
import { ThemeProvider, useMediaQuery, Dialog } from '@material-ui/core'
import { MaskbookDarkTheme, MaskbookLightTheme } from '../utils/theme'
import { action } from '@storybook/addon-actions'
import { useCurrentIdentity } from '../components/DataSource/useActivatedUI'
import { appearanceSettings, Appearance } from '../components/shared-settings/settings'
import { useValueRef } from '../utils/hooks/useValueRef'

function DashboardDialog({ children }: { children: React.ReactNode }) {
    const isPerferDark = useMediaQuery('(prefers-color-scheme: dark)')
    const apperance = useValueRef(appearanceSettings)
    return (
        <Router>
            <ThemeProvider
                theme={
                    (isPerferDark && apperance === Appearance.default) || apperance === Appearance.dark
                        ? MaskbookDarkTheme
                        : MaskbookLightTheme
                }>
                <Dialog open>{children}</Dialog>
            </ThemeProvider>
        </Router>
    )
}

storiesOf('Dashboard', module)
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
