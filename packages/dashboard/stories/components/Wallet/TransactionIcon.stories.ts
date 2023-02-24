import type { Meta } from '@storybook/react'
import { TransactionIconUI as component } from '../../../src/pages/Wallets/components/TransactionIcon/index.js'

export default {
    component,
    title: 'Components/Wallet/Transaction Icon',
    args: {
        isRedPacket: false,
        isFailed: false,
        type: 'Sent',
        transactionType: 'sent',
    },
} as Meta<typeof component>
