import { memo, useCallback, useState } from 'react'
import { PersonaHeader } from '../components/PersonaHeader'
import { makeStyles } from '@masknet/theme'
import { TipIcon } from '@masknet/icons'
import { Button, Typography } from '@material-ui/core'
import { useI18N } from '../../../../../utils'
import { StyledInput } from '../../../components/StyledInput'
import { useAsyncFn } from 'react-use'
import { PersonaContext } from '../hooks/usePersonaContext'
import Services from '../../../../service'
import { LoadingButton } from '@material-ui/lab'
import { useHistory } from 'react-router-dom'
import { PopupRoutes } from '../../../index'

const useStyles = makeStyles()((theme) => ({
    content: {
        flex: 1,
        padding: '30px 16px 0px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    icon: {
        fill: '#1C68F3',
        fontSize: 36,
    },
    title: {
        fontSize: 18,
        fontWeight: 500,
        lineHeight: '24px',
        color: '#1C68F3',
        marginTop: 12,
    },
    tips: {
        marginTop: 20,
        color: '#FF5555',
        fontSize: 13,
        linHeight: '18px',
    },
    controller: {
        padding: '0px 16px 16px 16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2,1fr)',
        gap: 20,
    },
    button: {
        padding: '10px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
    },
    password: {
        padding: '0 16px 20px 16px',
    },
}))

const Logout = memo(() => {
    const { currentPersona } = PersonaContext.useContainer()
    const history = useHistory()
    const backupPassword = localStorage.getItem('backupPassword')

    const [{ loading }, onLogout] = useAsyncFn(async () => {
        if (currentPersona) {
            await Services.Identity.logoutPersona(currentPersona.identifier)
            const lastCreatedPersona = await Services.Identity.queryLastPersonaCreated()
            if (lastCreatedPersona) await Services.Settings.setCurrentPersonaIdentifier(lastCreatedPersona.identifier)

            history.replace(PopupRoutes.Personas)
        }
    }, [currentPersona, history])
    return (
        <LogoutUI
            backupPassword={backupPassword ?? ''}
            loading={loading}
            onLogout={onLogout}
            onCancel={() => history.goBack()}
        />
    )
})

export interface LogoutUIProps {
    backupPassword: string
    loading: boolean
    onCancel: () => void
    onLogout: () => void
}

export const LogoutUI = memo<LogoutUIProps>(({ backupPassword, loading, onLogout, onCancel }) => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)

    const onConfirm = useCallback(() => {
        if (backupPassword && password === backupPassword) {
            onLogout()
        } else {
            setError(true)
        }
    }, [onLogout, backupPassword, password])

    return (
        <>
            <PersonaHeader />
            <div className={classes.content}>
                <TipIcon className={classes.icon} />
                <Typography className={classes.title}>{t('popups_persona_logout')}</Typography>
                <Typography className={classes.tips}>{t('popups_persona_disconnect_tip')}</Typography>
            </div>
            {backupPassword ? (
                <div className={classes.password}>
                    <StyledInput
                        placeholder="Backup Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={error}
                        helperText={error ? t('popups_password_do_not_match') : ''}
                    />
                </div>
            ) : null}
            <div className={classes.controller}>
                <Button
                    variant="contained"
                    className={classes.button}
                    onClick={onCancel}
                    style={{ backgroundColor: '#F7F9FA', color: '#1C68F3' }}>
                    {t('cancel')}
                </Button>
                <LoadingButton
                    loading={loading}
                    variant="contained"
                    className={classes.button}
                    color="error"
                    style={{ backgroundColor: '#ff5555' }}
                    onClick={onConfirm}>
                    {t('popups_persona_logout')}
                </LoadingButton>
            </div>
        </>
    )
})

export default Logout
