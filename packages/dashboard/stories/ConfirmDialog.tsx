import { story } from '@masknet/storybook-shared'
import C from '../src/components/ConfirmDialog'
import { action } from '@storybook/addon-actions'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Confirm Dialog',
})

export const ConfirmDialog = of({
    args: {
        open: true,
        title: 'Title',
        children: 'anything as content',
        onClose: action('onClose'),
        onConfirm: action('onConfirm'),
    },
})
