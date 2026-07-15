import { memo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box } from '@mui/material'
import { ActionButton } from '@masknet/theme'
import { type PersonaInformation, PopupRoutes, MaskMessages } from '@masknet/shared-base'
import { usePersonasFromDB } from '../../../../shared-ui/index.js'
import { SignRequestInfo } from '../../../components/SignRequestInfo/index.js'
import { BottomController } from '../../../components/BottomController/index.js'
import { useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'
import { Trans } from '@lingui/react/macro'

export const Component = memo(function PersonaSignRequest() {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const [requestID, setRequestID] = useState<string>()
    const [message, setMessage] = useState<string>('')
    const [selected, setSelected] = useState<PersonaInformation>()
    const personas = usePersonasFromDB()

    const source = params.get('source') || undefined

    useRenderPhraseCallbackOnDepsChange(() => {
        if (!personas.length) return
        const messageInURL = params.get('message')
        const requestIDInURL = params.get('requestID')
        const identifierInURL = params.get('identifier')
        const selectedPersona = personas.find((x) => x.identifier.toText() === identifierInURL) ?? personas[0]

        if (!messageInURL || !requestIDInURL || !selectedPersona) {
            Promise.try(() => navigate(PopupRoutes.Wallet, { replace: true }))
        } else {
            setSelected(selectedPersona)
            setMessage(messageInURL)
            setRequestID(requestIDInURL)
        }
    }, [personas, params])

    const [{ loading: confirmLoading }, handleConfirm] = useAsyncFn(async () => {
        if (!requestID || !selected) return
        const selectedPersona = selected.identifier
        MaskMessages.events.personaSignRequest.sendToBackgroundPage({
            requestID,
            selectedPersona,
        })

        const method = params.get('method')

        if (!method) {
            window.close()
            return
        }

        navigate(-1)
    }, [params, selected, requestID, message])

    const [{ loading: cancelLoading }, handleCancel] = useAsyncFn(async () => {
        if (!requestID) return
        MaskMessages.events.personaSignRequest.sendToBackgroundPage({ requestID })
        const method = params.get('method')
        if (!method) window.close()
        navigate(-1)
    }, [requestID, params])

    return (
        <Box p={2}>
            <SignRequestInfo message={message} rawMessage={message} origin={source} />
            <BottomController>
                <ActionButton loading={cancelLoading} onClick={handleCancel} fullWidth variant="outlined">
                    <Trans>Cancel</Trans>
                </ActionButton>
                <ActionButton loading={confirmLoading} onClick={handleConfirm} fullWidth>
                    <Trans>Sign</Trans>
                </ActionButton>
            </BottomController>
        </Box>
    )
})
