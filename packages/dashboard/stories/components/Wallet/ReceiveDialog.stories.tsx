import type { Meta } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { ReceiveDialogUI as component } from '../../../src/pages/Wallets/components/ReceiveDialog/index.js'

export default {
    component,
    title: 'Components/Wallet/Receive Dialog',
    args: {
        open: true,
        onClose: action('onClose'),
        address: '0xFD7A5D91AF554ACD8ED07c7911E8556a7D20D88a',
    },
} as Meta<typeof component>
