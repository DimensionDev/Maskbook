import { story } from '@masknet/storybook-shared'
import { action } from '@storybook/addon-actions'
import { CollectibleListUI as C } from '../../../src/pages/Wallets/components/CollectibleList'
import { ChainId, NonFungibleAssetProvider } from '@masknet/web3-shared-evm'

const { meta, of } = story(C)

export default meta({ title: 'Pages/Wallet/Collectible List' })

export const CollectibleList = of({
    args: {
        page: 1,
        onPageChange: action('onPageChange'),
        hasNextPage: false,
        isLoading: false,
        isEmpty: false,
        showPagination: true,
        chainId: ChainId.Mainnet,
        provider: NonFungibleAssetProvider.OPENSEA,
        dataSource: [],
    },
})
