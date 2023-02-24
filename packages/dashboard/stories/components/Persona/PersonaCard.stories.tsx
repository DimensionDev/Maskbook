import type { Meta } from '@storybook/react'
import { PersonaCardUI as component } from '../../../src/pages/Personas/components/PersonaCard/index.js'
import { ECKeyIdentifier, ProfileIdentifier, EnhanceableSite } from '@masknet/shared-base'
import { action } from '@storybook/addon-actions'

export default {
    component,
    title: 'Components/Persona/Persona Card',
    args: {
        active: false,
        profiles: [
            {
                identifier: ProfileIdentifier.of(EnhanceableSite.Twitter, 'hello').unwrap(),
            },
        ],
        identifier: new ECKeyIdentifier('secp256k1', ''),
        onClick: action('onClick'),
        onConnect: action('onConnect'),
        onDisconnect: action('onDisconnect'),
    },
} as Meta<typeof component>
