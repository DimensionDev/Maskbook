import type { Meta } from '@storybook/react'
import { CollectibleListUI as component } from '../../../src/pages/Wallets/components/CollectibleList/index.js'
import { ChainId } from '@masknet/web3-shared-evm'

export default {
    component,
    title: 'Pages/Wallet/Collectible List',
    args: {
        isLoading: false,
        isEmpty: false,
        chainId: ChainId.Mainnet,
        dataSource: [],
    },
} as Meta<typeof component>
