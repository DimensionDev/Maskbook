import type { Meta } from '@storybook/react'
import { PersonaSetup as component } from '../../../src/pages/Personas/components/PersonaSetup/index.js'
import { action } from '@storybook/addon-actions'
import { EnhanceableSite } from '@masknet/shared-base'

export default {
    component,
    title: 'Components/Persona/Persona Setup',
    args: {
        networkIdentifier: EnhanceableSite.Twitter,
        onConnect: action('onConnect'),
    },
} as Meta<typeof component>
