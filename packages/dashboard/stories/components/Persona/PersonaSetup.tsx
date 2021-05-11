import { story } from '@dimensiondev/maskbook-storybook-shared'
import { PersonaSetup as C } from '../../../src/pages/Personas/components/PersonaSetup'
import { action } from '@storybook/addon-actions'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Persona/Persona Setup',
})

export const PersonaSetup = of({
    args: {
        connected: false,
        networkIdentifier: 'twitter.com',
        onConnect: action('onConnect'),
    },
})
