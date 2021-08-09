import { story } from '@masknet/storybook-shared'
import { AddPersonaCard as C } from '../../../src/pages/Personas/components/AddPersonaCard'
import { action } from '@storybook/addon-actions'
const { meta, of } = story(C)

export default meta({ title: 'Components/Persona/Add Persona Card' })

export const AddPersonaCard = of({
    args: {
        onConfirm: action('onConfirm'),
        onCancel: action('onCancel'),
    },
})
