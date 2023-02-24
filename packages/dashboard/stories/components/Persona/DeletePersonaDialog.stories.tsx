import type { Meta } from '@storybook/react'
import { DeletePersonaDialog as component } from '../../../src/pages/Personas/components/DeletePersonaDialog/index.js'
import { action } from '@storybook/addon-actions'

export default {
    component,
    title: 'Components/Persona/Delete Persona Dialog',
    args: {
        open: true,
        onClose: action('onClose'),
        nickname: 'nuanyang233@gmail.com',
    },
} as Meta<typeof component>
