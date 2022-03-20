import { story } from '@masknet/storybook-shared'
import { PersonaSetup as C } from '../../../src/pages/Personas/components/PersonaSetup'
import { action } from '@storybook/addon-actions'
import { EnhanceableSite } from '@masknet/shared-base'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Persona/Persona Setup',
})

export const PersonaSetup = of({
    args: {
        networkIdentifier: EnhanceableSite.Twitter,
        onConnect: action('onConnect'),
    },
})
