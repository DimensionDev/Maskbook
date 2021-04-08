import { omit } from 'lodash-es'
import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import { MarketplaceMetaKey } from './constants'
import type { MarketplaceJSONPayloadInMask, MarketplaceJSONPayloadOutMask } from './types'
import schema from './schema.json'
import type { ERC20Token, ERC721Token, EtherToken } from '../../web3/types'
import { getConstant, isSameAddress } from '../../web3/helpers'
import { CONSTANTS } from '../../web3/constants'

export function sortTokens(tokenA: { address: string }, tokenB: { address: string }) {
    const ETH_ADDRESS = getConstant(CONSTANTS, 'ETH_ADDRESS')
    const addressA = tokenA.address.toLowerCase()
    const addressB = tokenB.address.toLowerCase()
    if (isSameAddress(addressA, ETH_ADDRESS)) return -1
    if (isSameAddress(addressB, ETH_ADDRESS)) return 1
    return addressA < addressB ? -1 : 1
}

export const MarketplaceMetadataReader = createTypedMessageMetadataReader<MarketplaceJSONPayloadOutMask>(
    MarketplaceMetaKey,
    schema,
)
export const renderWithMarketplaceMetadata = createRenderWithMetadata(MarketplaceMetadataReader)

export function tokenIntoMask(token: MarketplaceJSONPayloadOutMask['token']): EtherToken | ERC20Token | ERC721Token {
    return {
        ...omit(token, 'chain_id'),
        chainId: token.chain_id,
    }
}

export function tokenOutMask(token: ERC721Token) {
    return {
        ...omit(token, 'chainId'),
        chain_id: token.chainId,
    } as MarketplaceJSONPayloadOutMask['token']
}

export function payloadIntoMask(payload: MarketplaceJSONPayloadOutMask): MarketplaceJSONPayloadInMask {
    return {
        ...payload,
        token: tokenIntoMask(payload.token) as ERC721Token,
        exchange_tokens: payload.exchange_tokens.map(tokenIntoMask).sort(sortTokens) as (EtherToken | ERC20Token)[],
    }
}

export function payloadOutMask(payload: MarketplaceJSONPayloadInMask): MarketplaceJSONPayloadOutMask {
    return {
        ...payload,

        // HOTFIX of image payload
        // remove unnecessary chunks of data to reduce the size of payload
        token: tokenOutMask(payload.token),
        contract_address: 1,
        start_time: 0,
        end_time: 0,
        creation_time: 0,
        buyers: [],
        exchange_tokens: [],
    }
}
