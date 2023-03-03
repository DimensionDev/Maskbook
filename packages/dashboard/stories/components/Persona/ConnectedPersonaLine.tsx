import { story } from '@masknet/storybook-shared'
import { ConnectedPersonaLine as C } from '../../../src/pages/Personas/components/PersonaLine/index.js'
import { action } from '@storybook/addon-actions'
import { ProfileIdentifier } from '@masknet/shared-base'
import { EnhanceableSite } from '@masknet/web3-shared-base'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Persona/Connected Persona Line',
})

export const ConnectedPersonaLine = of({
    args: {
        profileIdentifiers: [ProfileIdentifier.of(EnhanceableSite.Twitter, 'userId').unwrap()],
        onDisconnect: action('onDisconnect'),
    },
})
