import { story } from '@dimensiondev/maskbook-storybook-shared'
import { DeletePersonaDialog as C } from '../src/pages/Personas/components/DeletePersonaDialog'
import { ECKeyIdentifier, IdentifierMap, ProfileIdentifier } from '@dimensiondev/maskbook-shared'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Delete Persona Dialog',
})

export const DeletePersonaDialog = of({
    args: {
        open: true,
        onClose: () => console.log('close'),
        persona: {
            createdAt: new Date('2021-04-26T13:31:18.442Z'),
            updatedAt: new Date('2021-04-26T13:31:39.697Z'),
            identifier: new ECKeyIdentifier('secp256k1', 'AvXlmrh+bDBrOfCyo6g6kIEMGXZg7vpago7SqGRFQH9z'),
            linkedProfiles: new IdentifierMap(new Map(), ProfileIdentifier),
            nickname: 'nuanyang233@gmail.com',
            mnemonic: {
                parameter: { path: "m/44'/60'/0'/0/0", withPassword: false },
                words: 'canyon human fiscal usual fever chase turkey seminar oven valve silk unlock',
            },
            uninitialized: false,
            hasPrivateKey: true,
            fingerprint: 'AvXlmrh+bDBrOfCyo6g6kIEMGXZg7vpago7SqGRFQH9z',
        },
    },
})
