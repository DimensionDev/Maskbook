import { memo, useEffect, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { Button, Typography } from '@mui/material'
import { MaskMessages, useI18N } from '../../../utils'
import { useHistory, useLocation } from 'react-router-dom'
import { ECKeyIdentifier, Identifier, PopupRoutes } from '@masknet/shared-base'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import type { Persona } from '../../../database'

const useStyles = makeStyles()(() => ({
    container: {
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    info: {
        backgroundColor: '#F7F9FA',
        padding: 10,
        borderRadius: 8,
    },
    title: {
        color: '#15181B',
        fontSize: 18,
        lineHeight: '24px',
        fontWeight: 500,
    },
    personaName: {
        color: '#15181B',
        fontSize: 16,
        lineHeight: '22px',
        margin: '10px 0',
    },
    secondary: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
        marginBottom: 10,
    },
    message: {
        color: '#15181B',
        fontSize: 12,
        lineHeight: '16px',
        flex: 1,
        wordBreak: 'break-all',
        maxHeight: 260,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    controller: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        padding: 16,
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#ffffff',
    },
    button: {
        fontWeight: 600,
        padding: '9px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
    },
    error: {
        color: '#FF5F5F',
        fontSize: 12,
        lineHeight: '16px',
        padding: '0px 16px 20px 16px',
        wordBreak: 'break-all',
    },
}))

const PersonaSignRequest = memo(() => {
    const { t } = useI18N()
    const history = useHistory()
    const location = useLocation()
    const { classes } = useStyles()
    const [requestID, setRequestID] = useState<string>()
    const [message, setMessage] = useState<string>()
    const [selected, setSelected] = useState<Persona>()
    const personas = useMyPersonas()

    useEffect(() => {
        if (!personas.length) return
        const url = new URLSearchParams(location.search)
        const messageInURL = url.get('message')
        const requestIDInURL = url.get('requestID')
        const identifierInURL = url.get('identifier')
        const selectedPersona = personas.find((x) => x.identifier.toText() === identifierInURL) ?? personas[0]

        if (!messageInURL || !requestIDInURL || !selectedPersona) {
            history.replace(PopupRoutes.Wallet)
        } else {
            setSelected(selectedPersona)
            setMessage(messageInURL)
            setRequestID(requestIDInURL)
        }
    }, [personas])

    const onSign = () => {
        if (!requestID || !selected) return
        MaskMessages.events.personaSignRequest.sendToBackgroundPage({
            requestID,
            selectedPersona: Identifier.fromString<ECKeyIdentifier>(
                selected.identifier.toText(),
                ECKeyIdentifier,
            ).unwrap(),
        })
        window.close()
    }

    const onCancel = () => {
        if (!requestID) return
        MaskMessages.events.personaSignRequest.sendToBackgroundPage({ requestID })
        window.close()
    }

    return (
        <main className={classes.container}>
            <div className={classes.info}>
                <Typography className={classes.title}>{t('popups_persona_sign_request_title')}</Typography>
                <Typography className={classes.personaName}>{selected?.nickname}</Typography>
                <Typography className={classes.secondary} style={{ wordBreak: 'break-all' }}>
                    {selected?.fingerprint}
                </Typography>
            </div>
            <Typography className={classes.secondary} style={{ marginTop: 20 }}>
                {t('popups_persona_sign_request_message')}:
            </Typography>
            <Typography className={classes.message}>{message}</Typography>
            <div className={classes.controller}>
                <Button className={classes.button} onClick={onCancel}>
                    {t('cancel')}
                </Button>
                <Button className={classes.button} onClick={onSign} variant="contained">
                    {t('sign')}
                </Button>
            </div>
        </main>
    )
})

export default PersonaSignRequest
