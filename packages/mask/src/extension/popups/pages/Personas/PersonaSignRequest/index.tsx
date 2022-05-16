import { memo, useEffect, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { Button, Typography } from '@mui/material'
import { MaskMessages, useI18N } from '../../../../../utils'
import { useNavigate, useLocation } from 'react-router-dom'
import { PersonaInformation, PopupRoutes } from '@masknet/shared-base'
import { useMyPersonas } from '../../../../../components/DataSource/useMyPersonas'
import { PersonaContext } from '../hooks/usePersonaContext'
import { MethodAfterPersonaSign } from '../../Wallet/type'
import { useAsyncFn } from 'react-use'
import Services from '../../../../service'
import { useTitle } from '../../../hook/useTitle'

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
        padding: '0 16px 20px 16px',
        wordBreak: 'break-all',
    },
}))

const PersonaSignRequest = memo(() => {
    const { t } = useI18N()
    const navigate = useNavigate()
    const location = useLocation()
    const { classes } = useStyles()
    const [requestID, setRequestID] = useState<string>()
    const [message, setMessage] = useState<string>()
    const [selected, setSelected] = useState<PersonaInformation>()
    const personas = useMyPersonas()
    const { currentPersona } = PersonaContext.useContainer()
    useEffect(() => {
        if (!personas.length) return
        const url = new URLSearchParams(location.search)
        const messageInURL = url.get('message')
        const requestIDInURL = url.get('requestID')
        const identifierInURL = url.get('identifier')
        const selectedPersona = personas.find((x) => x.identifier.toText() === identifierInURL) ?? personas[0]

        if (!messageInURL || !requestIDInURL || !selectedPersona) {
            navigate(PopupRoutes.Wallet, { replace: true })
        } else {
            setSelected(selectedPersona)
            setMessage(messageInURL)
            setRequestID(requestIDInURL)
        }
    }, [personas, location.search])

    const [, onSign] = useAsyncFn(async () => {
        const url = new URLSearchParams(location.search)
        if (!requestID || !selected) return
        const selectedPersona = selected.identifier
        MaskMessages.events.personaSignRequest.sendToBackgroundPage({
            requestID,
            selectedPersona,
        })

        const method = url.get('method') as MethodAfterPersonaSign | undefined

        if (!method) {
            window.close()
            return
        }

        // sign request from popup
        switch (method) {
            case MethodAfterPersonaSign.DISCONNECT_NEXT_ID:
                if (!message) break
                const signatureResult = await Services.Identity.generateSignResult(selectedPersona, message)

                const profileIdentifier = url.get('profileIdentifier')
                const platform = url.get('platform')
                const identity = url.get('identity')
                const createdAt = url.get('createdAt')
                const uuid = url.get('uuid')

                if (
                    !signatureResult ||
                    !profileIdentifier ||
                    !platform ||
                    !identity ||
                    !createdAt ||
                    !uuid ||
                    !currentPersona?.identifier.publicKeyAsHex
                )
                    break
                await Services.Identity.detachProfileWithNextID(
                    uuid,
                    currentPersona.identifier.publicKeyAsHex,
                    platform,
                    identity,
                    createdAt,
                    {
                        signature: signatureResult.signature.signature,
                    },
                )
                const profile = currentPersona.linkedProfiles.find((x) => x.identifier.toText() === profileIdentifier)
                if (!profile) break
                await Services.Identity.detachProfile(profile.identifier)
                break
        }
        navigate(-1)
    }, [location, selected, requestID, message, currentPersona])

    const onCancel = async () => {
        if (!requestID) return
        const url = new URLSearchParams(location.search)
        MaskMessages.events.personaSignRequest.sendToBackgroundPage({ requestID })
        const method = url.get('method')
        if (!method) window.close()
        navigate(-1)
    }

    useTitle('')

    return (
        <>
            <main className={classes.container}>
                <div className={classes.info}>
                    <Typography className={classes.title}>{t('popups_persona_sign_request_title')}</Typography>
                    <Typography className={classes.personaName}>{selected?.nickname}</Typography>
                    <Typography className={classes.secondary} style={{ wordBreak: 'break-all' }}>
                        {selected?.identifier.rawPublicKey}
                    </Typography>
                </div>
                <Typography className={classes.secondary} style={{ marginTop: 20 }}>
                    {t('popups_persona_sign_request_message')}:
                </Typography>
                <Typography className={classes.message}>{message}</Typography>
                <div className={classes.controller}>
                    <Button
                        className={classes.button}
                        style={{ backgroundColor: '#F7F9FA', color: '#1C68F3' }}
                        onClick={onCancel}>
                        {t('cancel')}
                    </Button>
                    <Button className={classes.button} onClick={onSign} variant="contained">
                        {t('sign')}
                    </Button>
                </div>
            </main>
        </>
    )
})

export default PersonaSignRequest
