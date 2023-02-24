import type { Meta } from '@storybook/react'
import { RenameDialog as component } from '../../../src/pages/Personas/components/RenameDialog/index.js'
import { action } from '@storybook/addon-actions'

export default {
    component,
    title: 'Components/Persona/Rename Dialog',
    args: {
        open: true,
        nickname: 'mask',
        onClose: action('onClose'),
        onConfirm: action('onConfirm'),
    },
} as Meta<typeof component>
