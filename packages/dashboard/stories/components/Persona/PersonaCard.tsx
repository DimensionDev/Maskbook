import { story } from '@masknet/storybook-shared'
import { PersonaCardUI as C } from '../../../src/pages/Personas/components/PersonaCard/index.js'
import { ECKeyIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { EnhanceableSite } from '@masknet/web3-shared-base'
import { action } from '@storybook/addon-actions'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Persona/Persona Card',
})

export const PersonaCard = of({
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
})
