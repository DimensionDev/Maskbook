import { story } from '@masknet/storybook-shared'
import { DeletePersonaDialog as C } from '../../../src/pages/Personas/components/DeletePersonaDialog'
import { action } from '@storybook/addon-actions'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Persona/Delete Persona Dialog',
})

export const DeletePersonaDialog = of({
    args: {
        open: true,
        onClose: action('onClose'),
        nickname: 'nuanyang233@gmail.com',
    },
})
