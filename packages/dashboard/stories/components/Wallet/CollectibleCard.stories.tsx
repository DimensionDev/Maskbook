import type { Meta } from '@storybook/react'
import { TokenType } from '@masknet/web3-shared-base'
import { SchemaType } from '@masknet/web3-shared-evm'
import { CollectibleCard as component } from '../../../src/pages/Wallets/components/CollectibleCard/index.js'

export default {
    component,
    title: 'Components/Wallet/Collectible Card',
    args: {
        asset: {
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
} as Meta<typeof component>
