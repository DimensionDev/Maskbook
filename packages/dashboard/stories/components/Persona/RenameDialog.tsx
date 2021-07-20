import { story } from '@masknet/storybook-shared'
import { RenameDialog as C } from '../../../src/pages/Personas/components/RenameDialog'
import { action } from '@storybook/addon-actions'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Persona/Rename Dialog',
})

export const RenameDialog = of({
    args: {
        open: true,
        nickname: 'maskbook',
        onClose: action('onClose'),
        onConfirm: action('onConfirm'),
    },
})
