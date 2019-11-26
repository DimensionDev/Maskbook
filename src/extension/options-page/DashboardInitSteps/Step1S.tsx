import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import StepBase from './StepBase'
import { Button, TextField } from '@material-ui/core'
import { geti18nString } from '../../../utils/i18n'

const header = 'Step 1: What is your name?'
const subheader = 'You may connect social network profiles to your persona in the next step.'

export default function InitStep1S() {
    const [name, setName] = useState('')
    const actions = (
        <>
            <Button className="actionButton" variant="outlined" color="default" component={Link} to="start">
                Back
            </Button>
            <Button
                className="actionButton"
                variant="contained"
                color="primary"
                component={Link}
                to={`2s?name=${name}`}>
                Next
            </Button>
        </>
    )
    const content = (
        <div style={{ alignSelf: 'stretch', textAlign: 'center', width: '100%' }}>
            <TextField
                style={{ width: '100%', maxWidth: '320px' }}
                autoFocus
                variant="outlined"
                value={name}
                onChange={e => setName(e.target.value)}
                label="Name"></TextField>
        </div>
    )

    return (
        <StepBase header={header} subheader={subheader} actions={actions}>
            {content}
        </StepBase>
    )
}
