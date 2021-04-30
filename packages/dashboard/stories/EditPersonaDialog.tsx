import { story } from '@dimensiondev/maskbook-storybook-shared'
import { EditPersonaDialog as C } from '../src/pages/Personas/components/EditPersonaDialog'
import { action } from '@storybook/addon-actions'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Edit Persona Dialog',
})

export const EditPersonaDialog = of({
    args: {
        providers: [
            { internalName: 'facebook.com', network: 'facebook.com', connected: false },
            {
                internalName: 'twitter.com',
                network: 'twitter.com',
                connected: true,
                userId: '4ZQ2t09g5nY395N',
            },
            { internalName: 'instagram.com', network: 'instagram.com', connected: false },
        ],
        nickname: 'nuanyang233@gmail.com',
        open: true,
        onClose: () => action('onClose'),
    },
})
