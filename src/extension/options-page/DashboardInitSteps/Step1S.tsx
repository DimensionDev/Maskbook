import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import StepBase from './StepBase'
import { TextField, makeStyles, createStyles } from '@material-ui/core'
import { geti18nString } from '../../../utils/i18n'
import Buttone from '../../../components/Dashboard/Buttone'

const header = 'Step 1: What is your name?'
const subheader = 'You may connect social network profiles to your persona in the next step.'

const useStyles = makeStyles(theme =>
    createStyles({
        input: {
            width: '100%',
            maxWidth: '320px',
        },
        container: {
            alignSelf: 'stretch',
            textAlign: 'center',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
        },
    }),
)

export default function InitStep1S() {
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')

    const classes = useStyles()

    const actions = (
        <>
            <Buttone className="actionButton" variant="outlined" color="default" component={Link} to="start">
                Back
            </Buttone>
            <Buttone
                className="actionButton"
                variant="contained"
                color="primary"
                component={Link}
                to={`2s?name=${name}`}>
                Next
            </Buttone>
        </>
    )
    const content = (
        <div className={classes.container}>
            <TextField
                autoFocus
                className={classes.input}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                value={name}
                onChange={e => setName(e.target.value)}
                label="Name"
                helperText=" "></TextField>
            <TextField
                className={classes.input}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                value={password}
                placeholder="Optional"
                type="password"
                onChange={e => setPassword(e.target.value)}
                label="Password"
                helperText="Set a password to upgrade security level"></TextField>
        </div>
    )

    return (
        <StepBase header={header} subheader={subheader} actions={actions}>
            {content}
        </StepBase>
    )
}
