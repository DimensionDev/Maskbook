import { story } from '@dimensiondev/maskbook-storybook-shared'
import { PersonaCard as C } from '../src/pages/Personas/components/PersonaCard'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Persona Card',
})

export const PersonaCard = of({
    args: {
        active: false,
        providers: [
            {
                internalName: 'twitter.com',
                connected: false,
                network: 'twitter.com',
            },
        ],
    },
})
