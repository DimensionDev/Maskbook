import type { Meta } from '@storybook/react'
import { Balance as component } from '../../../src/pages/Wallets/components/Balance/index.js'
import { action } from '@storybook/addon-actions'

export default {
    component,
    title: 'Components/Wallet/Balance Card',
    args: {
        onBuy: action('onBuy'),
        onSend: action('onSend'),
        onSwap: action('onSwap'),
        onReceive: action('onReceive'),
    },
} as Meta<typeof component>
