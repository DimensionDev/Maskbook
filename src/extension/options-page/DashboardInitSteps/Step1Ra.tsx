import React from 'react'
import StepBase from './StepBase'
import { Link, Redirect, useRouteMatch } from 'react-router-dom'
import { DialogRouter } from '../DashboardDialogs/DialogBase'
import { PersonaImportDialog } from '../DashboardDialogs/Persona'
import ActionButton from '../DashboardComponents/ActionButton'
import { useI18N } from '../../../utils/i18n-next-ui'
import { InitStep } from '../InitStep'

export default function InitStep1Ra() {
    const { t } = useI18N()
    const header = t('dashboard_advanced_restoration')
    const actions = (
        <>
            <ActionButton<typeof Link>
                variant="outlined"
                color="default"
                component={Link}
                to={`../${InitStep.Restore1}`}>
                {t('back')}
            </ActionButton>
            <span></span>
        </>
    )
    const content = (
        <div style={{ alignSelf: 'stretch', textAlign: 'center', width: '100%' }}>
            <ActionButton<typeof Link>
                width={240}
                variant="outlined"
                color="primary"
                component={Link}
                to="persona/import">
                {t('import_persona')}
            </ActionButton>
        </div>
    )

    const match = useRouteMatch()

    return (
        <>
            <StepBase header={header} actions={actions}>
                {content}
            </StepBase>
            <DialogRouter path="/persona/import" children={<PersonaImportDialog />} />
            {!match?.url.endsWith('/') && match?.isExact && <Redirect to={match?.url + '/'} />}
        </>
    )
}
