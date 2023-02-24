import type { Meta } from '@storybook/react'
import { EmptyPlaceholder as component } from '../../../src/pages/Wallets/components/EmptyPlaceholder/index.js'

export default {
    component,
    title: 'Pages/Wallet/Empty Placeholder',
    args: {
        children: 'Empty Placeholder',
    },
} as Meta<typeof component>
