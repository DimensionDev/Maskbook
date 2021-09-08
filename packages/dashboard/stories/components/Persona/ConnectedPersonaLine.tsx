import { story } from '@masknet/storybook-shared'
import { ConnectedPersonaLine as C } from '../../../src/pages/Personas/components/PersonaLine'
import { action } from '@storybook/addon-actions'
import { ProfileIdentifier } from '@masknet/shared'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Persona/Connected Persona Line',
})

export const ConnectedPersonaLine = of({
    args: {
        profileIdentifiers: [new ProfileIdentifier('twitter.com', 'userId')],
        onDisconnect: action('onDisconnect'),
    },
})
