import { story } from '@masknet/storybook-shared'
import { AddCollectibleDialogUI as C } from '../../../src/pages/Wallets/components/AddCollectibleDialog'
import { action } from '@storybook/addon-actions'

const { meta, of } = story(C)

export default meta({ title: 'Components/Wallet/Add Collectible Dialog' })

export const AddCollectibleDialog = of({
    args: {
        open: true,
        onClose: action('onClose'),
        address: '',
        onAddressChange: action('onAddressChange'),
        onSubmit: action('onSubmit'),
    },
})
