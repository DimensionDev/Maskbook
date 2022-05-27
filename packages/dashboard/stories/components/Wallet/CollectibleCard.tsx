import { story } from '@masknet/storybook-shared'
import { TokenType } from '@masknet/web3-shared-base'
import { SchemaType } from '@masknet/web3-shared-evm'
import { CollectibleCard as C } from '../../../src/pages/Wallets/components/CollectibleCard'

const { meta, of } = story(C)

export default meta({ title: 'Components/Wallet/Collectible Card' })
export const CollectibleCard = of({
    args: {
        token: {
            id: 'token_id',
            chainId: 1,
            tokenId: '608932',
            address: '',
            type: TokenType.NonFungible,
            schema: SchemaType.ERC721,
            owner: {
                nickname: 'test_owner',
            },
            metadata: {
                chainId: 1,
                name: 'Rarible 1155',
                symbol: 'RAB',
                description: '',
                mediaType: '',
            },
            contract: {
                chainId: 1,
                name: '',
                symbol: '',
                address: 'address',
                schema: SchemaType.ERC721,
            },
        },
        onSend() {},
    },
})
