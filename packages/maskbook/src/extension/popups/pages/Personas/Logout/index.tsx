import { memo, useCallback, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { MasksIcon, TipIcon } from '@masknet/icons'
import { Button, Typography } from '@material-ui/core'
import { useI18N } from '../../../../../utils'
import { StyledInput } from '../../../components/StyledInput'
import { useAsyncFn } from 'react-use'
import { PersonaContext } from '../hooks/usePersonaContext'
import Services from '../../../../service'
import { LoadingButton } from '@material-ui/lab'
import { useHistory } from 'react-router-dom'
import { PopupRoutes } from '../../../index'
import type { PersonaInformation } from '@masknet/shared-base'
import { formatFingerprint } from '@masknet/shared'

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
    iconContainer: {
        display: 'flex',
        alignItems: 'center',
        marginRight: 20,
    },
    name: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        color: '#1C68F3',
        fontWeight: 500,
    },
    identifier: {
        fontSize: 12,
        color: '#1C68F3',
        display: 'flex',
        alignItems: 'center',
        wordBreak: 'break-all',
    },
    personaContainer: {
        display: 'flex',
        backgroundColor: '#F7F9FA',
        borderRadius: 8,
        padding: '8px 16px',
        alignSelf: 'normal',
        margin: '20px 0',
    },
}))

const Logout = memo(() => {
    const { deletingPersona } = PersonaContext.useContainer()
    const history = useHistory()
    const backupPassword = localStorage.getItem('backupPassword')

    const [{ loading }, onLogout] = useAsyncFn(async () => {
        if (deletingPersona) {
            await Services.Identity.logoutPersona(deletingPersona.identifier)

            history.replace(PopupRoutes.Personas)
        }
    }, [deletingPersona, history])
    return (
        <LogoutUI
            deletingPersona={deletingPersona}
            backupPassword={backupPassword ?? ''}
            loading={loading}
            onLogout={onLogout}
            onCancel={() => history.goBack()}
        />
    )
})

export interface LogoutUIProps {
    deletingPersona?: PersonaInformation
    backupPassword: string
    loading: boolean
    onCancel: () => void
    onLogout: () => void
}

export const LogoutUI = memo<LogoutUIProps>(({ backupPassword, loading, onLogout, onCancel, deletingPersona }) => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)

    const onConfirm = useCallback(() => {
        if (!backupPassword || backupPassword === password) onLogout()
        else setError(true)
    }, [onLogout, backupPassword, password])

    return (
        <>
            <div className={classes.content}>
                <TipIcon className={classes.icon} />
                <Typography className={classes.title}>{t('popups_persona_logout')}</Typography>
                <div className={classes.personaContainer}>
                    <div className={classes.iconContainer}>
                        <MasksIcon />
                    </div>
                    <div>
                        <Typography className={classes.name}>{deletingPersona?.nickname}</Typography>
                        <Typography className={classes.identifier}>
                            {formatFingerprint(deletingPersona?.identifier.compressedPoint ?? '', 10)}
                        </Typography>
                    </div>
                </div>
                <Typography className={classes.tips}>{t('popups_persona_disconnect_tip')}</Typography>
            </div>

            {backupPassword ? (
                <div className={classes.password}>
                    <StyledInput
                        placeholder={t('popups_backup_password')}
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
