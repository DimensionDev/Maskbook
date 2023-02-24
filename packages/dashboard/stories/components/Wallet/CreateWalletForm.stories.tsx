import type { Meta } from '@storybook/react'
import { CreateWalletForm as component } from '../../../src/components/CreateWalletForm/index.js'
import { Icons } from '@masknet/icons'

export default {
    component,
    title: 'Components/Wallet/Create Wallet Form',
    args: {
        options: [{ label: 'ETH', value: 1, icon: <Icons.ETH /> }],
    },
} as Meta<typeof component>
