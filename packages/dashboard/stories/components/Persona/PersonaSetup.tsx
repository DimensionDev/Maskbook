import { story } from '@masknet/storybook-shared'
import { PersonaSetup as C } from '../../../src/pages/Personas/components/PersonaSetup'
import { action } from '@storybook/addon-actions'
import { SocialNetworkID } from '../../../../mask/shared'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Persona/Persona Setup',
})

export const PersonaSetup = of({
    args: {
        networkIdentifier: SocialNetworkID.Twitter,
        onConnect: action('onConnect'),
    },
})
