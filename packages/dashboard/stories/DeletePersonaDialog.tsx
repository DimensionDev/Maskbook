import { story } from '@dimensiondev/maskbook-storybook-shared'
import { DeletePersonaDialog as C } from '../src/pages/Personas/components/DeletePersonaDialog'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Delete Persona Dialog',
})

export const DeletePersonaDialog = of({
    args: {
        open: true,
        onClose: () => console.log('close'),
        nickname: 'nuanyang233@gmail.com',
    },
})
