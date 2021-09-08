import { story } from '@masknet/storybook-shared'
import { CollectibleCard as C } from '../../../src/pages/Wallets/components/CollectibleCard'
import { ChainId, createERC721Token, CollectibleProvider, EthereumTokenType } from '@masknet/web3-shared'

const { meta, of } = story(C)

export default meta({ title: 'Components/Wallet/Collectible Card' })
export const CollectibleCard = of({
    args: {
        chainId: ChainId.Mainnet,
        provider: CollectibleProvider.OPENSEA,
        token: createERC721Token(
            {
                type: EthereumTokenType.ERC721,
                address: '0xd07dc4262bcdbf85190c01c996b4c06a461d2430',
                chainId: ChainId.Mainnet,
                name: 'Rarible 1155',
                symbol: '',
            },
            {
                image: 'https://lh3.googleusercontent.com/gqxP0KlEJOXKiu8Qhxtk3lBU5dJqTyol8OgiDZjPB8HD5m-Rc_aLaLQ37j8gXhdgOueaB-qZ__1p7_8PZ3l0mkKOjN9uW0sBgt9n9Q',
                name: 'Dumb Stray Cats - #7',
            },
            '608932',
        ),
    },
})
