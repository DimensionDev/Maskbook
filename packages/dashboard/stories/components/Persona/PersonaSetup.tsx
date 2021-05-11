import { story } from '@dimensiondev/maskbook-storybook-shared'
import { PersonaSetup as C } from '../../../src/pages/Personas/components/PersonaSetup'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Persona/Persona Setup',
})

export const PersonaSetup = of({
    args: {
        provider: {
            networkIdentifier: 'twitter.com',
            connected: false,
        },
    },
})
