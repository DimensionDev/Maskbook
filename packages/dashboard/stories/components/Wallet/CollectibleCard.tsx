import { story } from '@masknet/storybook-shared'
import { CollectibleCard as C } from '../../../src/pages/Wallets/components/CollectibleCard'
import { Web3TokenType } from '@masknet/web3-shared-base'

const { meta, of } = story(C)

export default meta({ title: 'Components/Wallet/Collectible Card' })
export const CollectibleCard = of({
    args: {
        token: {
            tokenId: '608932',
            info: {
                name: 'Rarible 1155',
                description: '',
                owner: 'test_owner',
            },
            contractDetailed: {
                address: 'address',
                type: Web3TokenType.ERC721,
                chainId: 1,
                name: '',
                symbol: '',
            },
        },
        onSend() {},
    },
})
