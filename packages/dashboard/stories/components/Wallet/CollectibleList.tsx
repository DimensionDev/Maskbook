import { story } from '@masknet/storybook-shared'
import { CollectibleListUI as C } from '../../../src/pages/Wallets/components/CollectibleList'
import { ChainId } from '@masknet/web3-shared-evm'

const { meta, of } = story(C)

export default meta({ title: 'Pages/Wallet/Collectible List' })

export const CollectibleList = of({
    args: {
        isLoading: false,
        isEmpty: false,
        chainId: ChainId.Mainnet,
        dataSource: [],
    },
})
