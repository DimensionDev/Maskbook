import React from 'react'
import StepBase from './StepBase'
import { Button, Switch } from '@material-ui/core'
import { Link, Route, Redirect, useRouteMatch } from 'react-router-dom'
import { DialogRouter } from '../DashboardDialogs/DialogBase'
import { PersonaImportDialog } from '../DashboardDialogs/Persona'
import Buttone from '../../../components/Dashboard/Buttone'

const header = 'Advanced Restoration Options'

const actions = (
    <>
        <Buttone className="actionButton" variant="outlined" color="default" component={Link} to="../1r">
            Back
        </Buttone>
        <span></span>
    </>
)

export default function InitStep1Ra() {
    const content = (
        <div style={{ alignSelf: 'stretch', textAlign: 'center', width: '100%' }}>
            <Buttone width={240} variant="outlined" color="primary" component={Link} to="persona/import">
                Import Persona
            </Buttone>
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
