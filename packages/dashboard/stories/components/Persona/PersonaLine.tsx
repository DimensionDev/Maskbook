import { story } from '@dimensiondev/maskbook-storybook-shared'
import { PersonaLine as C } from '../../../src/pages/Personas/components/PersonaLine'
import { action } from '@storybook/addon-actions'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Persona/Persona Line',
})

export const PersonaLine = of({
    args: {
        networkIdentifier: 'twitter',
        connected: false,
        onConnect: action('onConnect'),
        onDisconnect: action('onDisconnect'),
        userId: '',
    },
})
