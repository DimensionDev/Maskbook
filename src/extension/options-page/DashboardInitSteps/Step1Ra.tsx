import React from 'react'
import StepBase from './StepBase'
import { Link, Redirect, useRouteMatch } from 'react-router-dom'
import { DialogRouter } from '../DashboardDialogs/DialogBase'
import { PersonaImportDialog } from '../DashboardDialogs/Persona'
import ActionButton from '../DashboardComponents/ActionButton'
import { geti18nString } from '../../../utils/i18n'
import { Box } from '@material-ui/core'

const header = geti18nString('dashboard_advanced_restoration')

const actions = (
    <>
        <ActionButton<typeof Link> variant="outlined" color="default" component={Link} to="../1r">
            {geti18nString('back')}
        </ActionButton>
        <span></span>
    </>
)

export default function InitStep1Ra() {
    const content = (
        <Box display="flex" style={{ width: '100%', justifyContent: 'center' }}>
            <ActionButton<typeof Link>
                width={240}
                variant="outlined"
                color="primary"
                component={Link}
                to="persona/import">
                {geti18nString('import_persona')}
            </ActionButton>
        </Box>
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
