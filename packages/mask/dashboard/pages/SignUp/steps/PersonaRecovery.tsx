import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSnackbar } from '@masknet/theme'
import { DashboardRoutes, type ECKeyIdentifier, type EC_Public_JsonWebKey } from '@masknet/shared-base'
import Services from '#services'
import { PersonaNameUI } from './PersonaNameUI.js'
import { createPersonaByPrivateKey, createPersonaV2 } from '../../../hooks/useCreatePersonaV2.js'
import { delay } from '@masknet/kit'
import { useAsync, useAsyncFn } from 'react-use'
import urlcat from 'urlcat'
import { Trans } from '@lingui/react/macro'

export function Component() {
    const navigate = useNavigate()

    const createPersona = createPersonaV2
    const { enqueueSnackbar } = useSnackbar()

    const state = useLocation().state as {
        mnemonic?: string[]
        privateKey?: string
    }

    const [error, setError] = useState('')

    useAsync(async () => {
        if (state.mnemonic && (await Services.Identity.validateMnemonic(state.mnemonic.join(' ')))) return
        if (state.privateKey) return
        navigate(DashboardRoutes.SignUp, { replace: true })
    }, [state.mnemonic, state.privateKey])

    const [{ loading }, onNext] = useAsyncFn(
        async (personaName: string) => {
            setError('')

            try {
                let result:
                    | {
                          address: string
                          identifier: ECKeyIdentifier
                          publicKey: EC_Public_JsonWebKey
                      }
                    | undefined

                if (state.mnemonic) {
                    result = await Services.Identity.queryPersonaEOAByMnemonic(state.mnemonic.join(' '), '')
                } else if (state.privateKey) {
                    result = await Services.Identity.queryPersonaEOAByPrivateKey(state.privateKey)
                } else {
                    setError('no available identifier')
                    return
                }

                let identifier: ECKeyIdentifier
                if (state.mnemonic) {
                    identifier = await createPersona(state.mnemonic.join(' '), personaName)
                } else if (state.privateKey) {
                    identifier = await createPersonaByPrivateKey(state.privateKey, personaName)
                } else {
                    setError('no available identifier')
                    return
                }

                await Services.Settings.setCurrentPersonaIdentifier(identifier)
                enqueueSnackbar(<Trans>Persona created.</Trans>, { variant: 'success' })

                await delay(300)
                navigate(
                    urlcat(DashboardRoutes.SignUpPersonaOnboarding, {
                        count: 0,
                    }),
                    { replace: true },
                )
            } catch (error) {
                setError((error as Error).message)
            }
        },
        [state?.mnemonic, state?.privateKey],
    )

    return <PersonaNameUI onNext={onNext} error={error} loading={loading} />
}
