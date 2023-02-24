import type { Meta } from '@storybook/react'
import { TokenTableUI as component } from '../../../src/pages/Wallets/components/FungibleTokenTable/index.js'

export default {
    component,
    title: 'Components/Wallet/Token Table',
    args: {
        isLoading: false,
        isEmpty: true,
        dataSource: [],
    },
} as Meta<typeof component>
