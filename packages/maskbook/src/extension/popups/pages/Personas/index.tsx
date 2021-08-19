import { memo } from 'react'
import { useI18N } from '../../../../utils'
import { PersonaStartUp } from './components/StartUp'

const Persona = memo(() => {
    const { t } = useI18N()

    return <PersonaStartUp />
})

export default Persona
