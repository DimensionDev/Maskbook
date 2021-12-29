import { story } from '@masknet/storybook-shared'
import { CollectibleCard as C } from '../../../src/pages/Wallets/components/CollectibleCard'
import { TokenType } from '@masknet/plugin-infra'

const { meta, of } = story(C)

export default meta({ title: 'Components/Wallet/Collectible Card' })
export const CollectibleCard = of({
    args: {
        chainId: 1,
        token: {
            id: 'token_id',
            chainId: 1,
            tokenId: '608932',
            type: TokenType.NonFungible,
            name: 'Rarible 1155',
            description: '',
            owner: 'test_owner',
            metadata: {
                name: 'Rarible 1155',
                description: '',
                mediaType: '',
            },
            contract: {
                address: 'address',
                chainId: 1,
                name: '',
                symbol: '',
            },
        },
        onSend() {},
    },
})
