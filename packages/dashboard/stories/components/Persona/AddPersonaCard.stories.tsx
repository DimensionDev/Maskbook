import type { Meta } from '@storybook/react'
import { AddPersonaCard as component } from '../../../src/pages/Personas/components/AddPersonaCard/index.js'
import { action } from '@storybook/addon-actions'

export default {
    component,
    title: 'Components/Persona/Add Persona Card',
    args: {
        onConfirm: action('onConfirm'),
        onCancel: action('onCancel'),
    },
} as Meta<typeof component>
