import type { Meta } from '@storybook/react'
import { WalletQRCodeContainer as component } from '../../../src/components/WalletQRCodeContainer/index.js'

export default {
    component,
    title: 'Components/Wallet/Wallet QR Code Container',
    args: {
        width: 330,
        height: 330,
        border: {
            borderHeight: 2,
            borderWidth: 15,
        },
    },
} as Meta<typeof component>
