import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import { useDashboardI18N } from '../../../locales/index.js'
import { SignUpRoutePath } from '../routePath.js'
import { Services } from '../../../../shared-ui/service.js'
import { PersonaNameUI } from './PersonaNameUI.js'

export function PersonaCreate() {
    const t = useDashboardI18N()
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
