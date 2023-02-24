import type { Meta } from '@storybook/react'
import { UnconnectedPersonaLine as component } from '../../../src/pages/Personas/components/PersonaLine/index.js'
import { action } from '@storybook/addon-actions'

export default {
    component,
    title: 'Components/Persona/Unconnected Persona Line',
    args: {
        networkIdentifier: 'twitter',
        onConnect: action('onConnect'),
    },
} as Meta<typeof component>
