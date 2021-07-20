import { story } from '@masknet/storybook-shared'
import { ConnectedPersonaLine as C } from '../../../src/pages/Personas/components/PersonaLine'
import { action } from '@storybook/addon-actions'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Persona/Connected Persona Line',
})

export const ConnectedPersonaLine = of({
    args: {
        userId: 'nickname',
        onDisconnect: action('onDisconnect'),
    },
})
