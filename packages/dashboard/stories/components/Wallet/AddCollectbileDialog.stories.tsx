import type { Meta } from '@storybook/react'
import { AddCollectibleDialogUI as component } from '../../../src/pages/Wallets/components/AddCollectibleDialog/index.js'
import { action } from '@storybook/addon-actions'

export default {
    component,
    title: 'Components/Wallet/Add Collectible Dialog',
    args: {
        open: true,
        onClose: action('onClose'),
        address: '',
        onAddressChange: action('onAddressChange'),
        onSubmit: action('onSubmit'),
    },
} as Meta<typeof component>
