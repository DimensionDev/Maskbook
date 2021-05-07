import { story } from '@dimensiondev/maskbook-storybook-shared'
import { EditPersonaDialog as C } from '../src/pages/Personas/components/EditPersonaDialog'
import { action } from '@storybook/addon-actions'
import { ProfileIdentifier } from '@dimensiondev/maskbook-shared'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Edit Persona Dialog',
})

export const EditPersonaDialog = of({
    args: {
        providers: [
            {
                internalName: 'facebook.com',
                network: 'facebook.com',
                connected: false,
                identifier: new ProfileIdentifier('facebook.com', ''),
            },
            {
                internalName: 'twitter.com',
                network: 'twitter.com',
                connected: true,
                userId: '4ZQ2t09g5nY395N',
                identifier: new ProfileIdentifier('twitter.com', ''),
            },
            {
                internalName: 'instagram.com',
                network: 'instagram.com',
                connected: false,
                identifier: new ProfileIdentifier('instagram.com', ''),
            },
        ],
        nickname: 'nuanyang233@gmail.com',
        open: true,
        onClose: () => action('onClose'),
    },
})
