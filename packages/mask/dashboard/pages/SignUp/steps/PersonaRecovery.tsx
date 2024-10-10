import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCustomSnackbar } from '@masknet/theme'
import { DashboardRoutes, EMPTY_LIST, type ECKeyIdentifier, type EC_Public_JsonWebKey } from '@masknet/shared-base'
import Services from '#services'
import { PersonaNameUI } from './PersonaNameUI.js'
import { useCreatePersonaByPrivateKey, useCreatePersonaV2 } from '../../../hooks/useCreatePersonaV2.js'
import { delay } from '@masknet/kit'
import { useAsync, useAsyncFn } from 'react-use'
import { SmartPayBundler, SmartPayOwner } from '@masknet/web3-providers'
import urlcat from 'urlcat'
import { Trans } from '@lingui/macro'

export function Component() {
    const navigate = useNavigate()

    const createPersona = useCreatePersonaV2()
    const createPersonaByPrivateKey = useCreatePersonaByPrivateKey()
    const { showSnackbar } = useCustomSnackbar()

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

    const changeCurrentPersona = useCallback(Services.Settings.setCurrentPersonaIdentifier, [])

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

                const chainId = await SmartPayBundler.getSupportedChainId()
                const accounts =
                    result?.address ? await SmartPayOwner.getAccountsByOwner(chainId, result.address) : EMPTY_LIST

                let identifier: ECKeyIdentifier
                if (state.mnemonic) {
                    identifier = await createPersona(state.mnemonic.join(' '), personaName)
                } else if (state.privateKey) {
                    identifier = await createPersonaByPrivateKey(state.privateKey, personaName)
                } else {
                    setError('no available identifier')
                    return
                }

                await changeCurrentPersona(identifier)
                showSnackbar(<Trans>Persona created.</Trans>, { variant: 'success' })

                await delay(300)
                navigate(
                    urlcat(DashboardRoutes.SignUpPersonaOnboarding, {
                        count: accounts.filter((x) => x.deployed).length,
                    }),
                    { replace: true },
                )
            } catch (error) {
                setError((error as Error).message)
            }
        },
        [state?.mnemonic, state?.privateKey, changeCurrentPersona],
    )

    return <PersonaNameUI onNext={onNext} error={error} loading={loading} />
}
