import type { Meta } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import component from '../src/components/ConfirmDialog/index.js'

export default {
    component,
    title: 'Components/Confirm Dialog',
    args: {
        open: true,
        title: 'Title',
        children: 'anything as content',
        onClose: action('onClose'),
        onConfirm: action('onConfirm'),
    },
} as Meta<typeof component>
