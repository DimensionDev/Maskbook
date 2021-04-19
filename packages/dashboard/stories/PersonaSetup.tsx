import { story } from '@dimensiondev/maskbook-storybook-shared'
import { PersonaSetup as C } from '../src/pages/Personas/components/PersonaSetup'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Persona Setup',
})

export const PersonaSetup = of({
    args: {
        provider: {
            tabName: 'twitter',
            internalName: 'twitter.com',
            network: 'twitter.com',
            connected: false,
        },
    },
})
