import type { Meta } from '@storybook/react'
import { ConnectedPersonaLine as component } from '../../../src/pages/Personas/components/PersonaLine/index.js'
import { action } from '@storybook/addon-actions'
import { ProfileIdentifier, EnhanceableSite } from '@masknet/shared-base'

export default {
    component,
    title: 'Components/Persona/Connected Persona Line',
    args: {
        profileIdentifiers: [ProfileIdentifier.of(EnhanceableSite.Twitter, 'userId').unwrap()],
        onDisconnect: action('onDisconnect'),
    },
} as Meta<typeof component>
