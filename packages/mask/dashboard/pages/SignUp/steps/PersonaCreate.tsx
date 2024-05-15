import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import { useDashboardTrans } from '../../../locales/index.js'
import { SignUpRoutePath } from '../routePath.js'
import Services from '#services'
import { PersonaNameUI } from './PersonaNameUI.js'

export function Component() {
    const t = useDashboardTrans()
    const navigate = useNavigate()

    const [error, setError] = useState('')

    const onNext = async (personaName: string) => {
        setError('')

        const personas = await Services.Identity.queryOwnedPersonaInformation(true)
        const existing = personas.some((x) => x.nickname === personaName)

        if (existing) {
            return setError(t.create_account_persona_exists())
        }

        navigate(`${DashboardRoutes.SignUp}/${SignUpRoutePath.MnemonicReveal}`, {
            replace: true,
            state: {
                personaName,
            },
        })
    }

    return <PersonaNameUI onNext={onNext} error={error} />
}
