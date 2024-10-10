import { memo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box } from '@mui/material'
import { ActionButton } from '@masknet/theme'
import { PersonaContext } from '@masknet/shared'
import { type PersonaInformation, PopupRoutes, SignType, MaskMessages } from '@masknet/shared-base'
import { MethodAfterPersonaSign } from '../../Wallet/type.js'
import Services from '#services'
import { usePersonasFromDB } from '../../../../shared-ui/index.js'
import { SignRequestInfo } from '../../../components/SignRequestInfo/index.js'
import { BottomController } from '../../../components/BottomController/index.js'
import { useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'
import { Trans } from '@lingui/macro'

export const Component = memo(function PersonaSignRequest() {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const [requestID, setRequestID] = useState<string>()
    const [message, setMessage] = useState<string>('')
    const [selected, setSelected] = useState<PersonaInformation>()
    const personas = usePersonasFromDB()
    const { currentPersona } = PersonaContext.useContainer()

    const source = params.get('source') || undefined

    useRenderPhraseCallbackOnDepsChange(() => {
        if (!personas.length) return
        const messageInURL = params.get('message')
        const requestIDInURL = params.get('requestID')
        const identifierInURL = params.get('identifier')
        const selectedPersona = personas.find((x) => x.identifier.toText() === identifierInURL) ?? personas[0]

        if (!messageInURL || !requestIDInURL || !selectedPersona) {
            Promise.resolve().then(() => navigate(PopupRoutes.Wallet, { replace: true }))
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

        const method = params.get('method') as MethodAfterPersonaSign | undefined

        if (!method) {
            window.close()
            return
        }

        // sign request from popup
        switch (method) {
            case MethodAfterPersonaSign.DISCONNECT_NEXT_ID:
                if (!message) break
                const signature = await Services.Identity.signWithPersona(
                    SignType.Message,
                    message,
                    selectedPersona,
                    location.origin,
                    true,
                )

                const profileIdentifier = params.get('profileIdentifier')
                const platform = params.get('platform')
                const identity = params.get('identity')
                const createdAt = params.get('createdAt')
                const uuid = params.get('uuid')

                if (
                    !signature ||
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
                        signature,
                    },
                )
                const profile = currentPersona.linkedProfiles.find((x) => x.identifier.toText() === profileIdentifier)
                if (!profile) break
                await Services.Identity.detachProfile(profile.identifier)
                break
        }
        navigate(-1)
    }, [params, selected, requestID, message, currentPersona])

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
