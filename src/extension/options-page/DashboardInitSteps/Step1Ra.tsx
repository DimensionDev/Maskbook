import React from 'react'
import StepBase from './StepBase'
import { Button, Switch } from '@material-ui/core'
import { Link, Route, Redirect, useRouteMatch } from 'react-router-dom'
import { DialogRouter } from '../DashboardDialogs/DialogBase'
import { PersonaImportDialog } from '../DashboardDialogs/Persona'

const header = 'Advanced Restoration Options'

const actions = (
    <>
        <Button className="actionButton" variant="outlined" color="default" component={Link} to="../1r">
            Back
        </Button>
        <span></span>
    </>
)

export default function InitStep1Ra() {
    const content = (
        <div style={{ alignSelf: 'stretch', textAlign: 'center', width: '100%' }}>
            <Button style={{ width: 250 }} variant="outlined" color="primary" component={Link} to="persona/import">
                Import Persona
            </Button>
        </div>
    )

    const match = useRouteMatch()
    console.log(match)

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
