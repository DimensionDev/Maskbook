import { story } from '@dimensiondev/maskbook-storybook-shared'
import { PersonaCard as C } from '../../../src/pages/Personas/components/PersonaCard'
import { ProfileIdentifier } from '@dimensiondev/maskbook-shared'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Persona/Persona Card',
})

export const PersonaCard = of({
    args: {
        active: false,
        providers: [
            {
                internalName: 'twitter.com',
                connected: false,
                network: 'twitter.com',
                identifier: new ProfileIdentifier('twitter.com', ''),
            },
        ],
    },
})
