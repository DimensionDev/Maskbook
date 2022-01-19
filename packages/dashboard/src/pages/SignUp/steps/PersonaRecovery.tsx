import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCustomSnackbar } from '@masknet/theme'
import { DashboardRoutes, delay } from '@masknet/shared-base'
import { useDashboardI18N } from '../../../locales'
import { SignUpRoutePath } from '../routePath'
import { Services } from '../../../API'
import { PersonaNameUI } from './PersonaNameUI'
import { useCreatePersonaByPrivateKey, useCreatePersonaV2 } from '../../../hooks/useCreatePersonaV2'
import { PersonaContext } from '../../Personas/hooks/usePersonaContext'

export const PersonaRecovery = () => {
    const t = useDashboardI18N()
    const navigate = useNavigate()

    const createPersona = useCreatePersonaV2()
    const createPersonaByPrivateKey = useCreatePersonaByPrivateKey()
    const { showSnackbar } = useCustomSnackbar()
    const { changeCurrentPersona } = PersonaContext.useContainer()
    const { state } = useLocation() as { state: { mnemonic: string[]; privateKey: string } }

    const [error, setError] = useState('')

    useEffect(() => {
        if (
            (!state?.mnemonic || !Services.Identity.validateMnemonic(state?.mnemonic.join(' '))) &&
            !state?.privateKey
        ) {
            navigate(DashboardRoutes.SignUp, { replace: true })
        }
    }, [state?.mnemonic, state?.privateKey])

    const onNext = useCallback(
        async (personaName: string) => {
            setError('')
            try {
                const identifier = state?.mnemonic
                    ? await createPersona(state?.mnemonic.join(' '), personaName)
                    : await createPersonaByPrivateKey(state?.privateKey, personaName)

                await changeCurrentPersona(identifier)
                showSnackbar(t.create_account_persona_successfully(), { variant: 'success' })

                await delay(300)
                navigate(`${DashboardRoutes.SignUp}/${SignUpRoutePath.ConnectSocialMedia}`)
            } catch (error) {
                setError((error as Error).message)
            }
        },
        [state?.mnemonic, state?.privateKey],
    )

    return <PersonaNameUI onNext={onNext} error={error} />
}
