import { story } from '@dimensiondev/maskbook-storybook-shared'
import { CollectibleCard as C } from '../../../src/pages/Wallets/components/CollectibleCard'
import { ChainId, createERC721Token } from '@dimensiondev/web3-shared'
import { CollectibleProvider } from '../../../src/pages/Wallets/types'

const { meta, of } = story(C)

export default meta({ title: 'Components/Wallet/Collectible Card' })
export const CollectibleCard = of({
    args: {
        chainId: ChainId.Mainnet,
        provider: CollectibleProvider.OPENSEAN,
        token: createERC721Token(ChainId.Mainnet, '', '', '', ''),
    },
})
