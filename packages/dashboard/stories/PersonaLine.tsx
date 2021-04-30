import { story } from '@dimensiondev/maskbook-storybook-shared'
import { PersonaLine as C } from '../src/pages/Personas/components/PersonaLine'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Persona Line',
})

export const PersonaLine = of({
    args: {
        internalName: 'twitter',
        connected: false,
    },
})
