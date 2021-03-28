import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import { PLUGIN_META_KEY } from './constants'
import type { CollectibleJSON_Payload } from './types'
import schema from './schema.json'
import { ChainId, EthereumTokenType } from '../../web3/types'

export const CollectibleMetadataReader = createTypedMessageMetadataReader<CollectibleJSON_Payload>(
    PLUGIN_META_KEY,
    schema,
)
export const renderWithCollectibleMetadata = createRenderWithMetadata(CollectibleMetadataReader)

export function composeJSON_Payload(): CollectibleJSON_Payload {
    return {
        token: {
            type: EthereumTokenType.ERC721,
            address: '',
            name: 'TEST',
            symbol: 'TEST',
            chainId: ChainId.Mainnet,
            tokenId: '1',
        },
    }
}
