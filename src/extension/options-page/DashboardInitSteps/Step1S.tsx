import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import StepBase from './StepBase'
import { TextField, makeStyles, createStyles } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import ActionButton from '../DashboardComponents/ActionButton'
import Services from '../../service'
import { InitStep } from '../InitStep'
import { useMultiStateValidator } from 'react-use'

const useStyles = makeStyles((theme) =>
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
    const { t } = useI18N()
    const header = t('dashboard_init_step_1')
    const subheader = t('dashboard_init_step_1_hint')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')

    const classes = useStyles()
    const history = useHistory()

    //#region validation
    type ValidationResult = [boolean, string, string]
    type ValidationState = [string, string]
    const [[isValid, nameErrorMessage, passwordErrorMessage]] = useMultiStateValidator<
        ValidationResult,
        ValidationState,
        ValidationResult
    >(
        [name, password],
        ([name, password]: ValidationState): ValidationResult => [
            Boolean(name && password),
            name ? '' : t('error_name_absent'),
            password ? '' : t('error_password_absent'),
        ],
    )
    const [submitted, setSubmitted] = useState(false)
    //#endregion

    const createPersonaAndNext = async () => {
        setSubmitted(true)
        if (!isValid) return
        const persona = await Services.Identity.createPersonaByMnemonic(name, password)
        history.replace(`${InitStep.Setup2}?identifier=${encodeURIComponent(persona.toText())}`)
    }
    const actions = (
        <>
            <ActionButton<typeof Link> variant="outlined" color="default" component={Link} to="start">
                {t('back')}
            </ActionButton>
            <ActionButton variant="contained" color="primary" onClick={createPersonaAndNext} component="a">
                {t('next')}
            </ActionButton>
        </>
    )
    const content = (
        <div className={classes.container}>
            <TextField
                required
                error={submitted && Boolean(nameErrorMessage)}
                autoFocus
                className={classes.input}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                label="Name"
                helperText={(submitted && nameErrorMessage) || ' '}
            />
            <TextField
                required
                error={submitted && Boolean(passwordErrorMessage)}
                className={classes.input}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                value={password}
                placeholder={t('dashboard_password_hint')}
                type="password"
                label="Password"
                onChange={(e) => setPassword(e.target.value)}
                helperText={(submitted && passwordErrorMessage) || t('dashboard_password_helper_text')}
            />
        </div>
    )

    return (
        <StepBase header={header} subheader={subheader} actions={actions}>
            {content}
        </StepBase>
    )
}
