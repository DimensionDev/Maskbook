import { makeStyles } from '@masknet/theme'
import { memo, useState } from 'react'
import { Typography } from '@mui/material'
import { StyledInput } from '../../../components/StyledInput'
import { LoadingButton } from '@mui/lab'
import { useI18N } from '../../../../../utils'
import { useHistory } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import { PersonaContext } from '../hooks/usePersonaContext'
import Services from '../../../../service'
import { PopupRoutes } from '../../../index'

const useStyles = makeStyles()({
    header: {
        padding: '10px 16px',
        backgroundColor: '#EFF5FF',
        color: '#1C68F3',
    },
    title: {
        fontSize: 14,
        lineHeight: '20px',
    },
    content: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 16,
    },
    button: {
        padding: '9px 0',
        borderRadius: 20,
    },
})

const PERSONA_NAME_MAX_LENGTH = 24

const PersonaRename = memo(() => {
    const { t } = useI18N()
    const history = useHistory()
    const [name, setName] = useState('')
    const [error, setError] = useState(false)
    const { currentPersona } = PersonaContext.useContainer()
    const { classes } = useStyles()

    const [{ loading }, renamePersona] = useAsyncFn(async () => {
        if (!name || !currentPersona) return
        if (name.length >= PERSONA_NAME_MAX_LENGTH) {
            setError(true)
            return
        }

        await Services.Identity.renamePersona(currentPersona.identifier, name)
        history.replace(PopupRoutes.Personas)
    }, [currentPersona, name])

    return (
        <>
            <div className={classes.header}>
                <Typography className={classes.title}>{t('rename')}</Typography>
            </div>
            <div className={classes.content}>
                <StyledInput
                    onChange={(e) => setName(e.target.value)}
                    defaultValue={currentPersona?.nickname}
                    error={error}
                    helperText={error ? t('popups_rename_error_tip', { length: PERSONA_NAME_MAX_LENGTH }) : null}
                />
                <LoadingButton
                    fullWidth
                    loading={loading}
                    variant="contained"
                    disabled={!name}
                    className={classes.button}
                    onClick={renamePersona}>
                    {t('confirm')}
                </LoadingButton>
            </div>
        </>
    )
})

export default PersonaRename
