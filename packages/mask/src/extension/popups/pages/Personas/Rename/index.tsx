import { makeStyles } from '@masknet/theme'
import { memo, useState } from 'react'
import { StyledInput } from '../../../components/StyledInput'
import { LoadingButton } from '@mui/lab'
import { useI18N } from '../../../../../utils'
import { useNavigate } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import { PersonaContext } from '../hooks/usePersonaContext'
import Services from '../../../../service'
import { PopupRoutes } from '@masknet/shared-base'
import { useTitle } from '../../../hook/useTitle'

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
        fontWeight: 600,
        padding: '9px 0',
        borderRadius: 20,
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: '#1C68F3!important',
        color: '#ffffff!important',
    },
})

const PERSONA_NAME_MAX_LENGTH = 24

const PersonaRename = memo(() => {
    const { t } = useI18N()
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const { selectedPersona } = PersonaContext.useContainer()
    const { classes } = useStyles()

    const [{ loading }, renamePersona] = useAsyncFn(async () => {
        if (!name || !selectedPersona) return
        if (name.length > PERSONA_NAME_MAX_LENGTH) {
            setError(t('popups_rename_error_tip', { length: PERSONA_NAME_MAX_LENGTH }))
            return
        }

        try {
            await Services.Identity.renamePersona(selectedPersona.identifier, name)
        } catch (error) {
            setError(t('popups_persona_persona_name_exists'))
            return
        }
        navigate(PopupRoutes.Personas, { replace: true })
    }, [selectedPersona, name])

    useTitle(t('popups_rename'))

    return (
        <>
            <div className={classes.content}>
                <StyledInput
                    onChange={(e) => setName(e.target.value)}
                    defaultValue={selectedPersona?.nickname}
                    error={!!error}
                    helperText={error}
                />
                <LoadingButton
                    fullWidth
                    loading={loading}
                    variant="contained"
                    disabled={!name}
                    classes={{ root: classes.button, disabled: classes.disabled }}
                    onClick={renamePersona}>
                    {t('confirm')}
                </LoadingButton>
            </div>
        </>
    )
})

export default PersonaRename
