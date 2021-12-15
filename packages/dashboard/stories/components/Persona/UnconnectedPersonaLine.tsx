import { story } from '@masknet/storybook-shared'
import { UnconnectedPersonaLine as C } from '../../../src/pages/Personas/components/PersonaLine'
import { action } from '@storybook/addon-actions'
import { SocialNetworkID } from '../../../../mask/shared'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Persona/Unconnected Persona Line',
})

export const UnconnectedPersonaLine = of({
    args: {
        networkIdentifier: SocialNetworkID.Twitter,
        onConnect: action('onConnect'),
    },
})
