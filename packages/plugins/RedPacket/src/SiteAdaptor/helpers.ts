import { createRenderWithMetadata, createTypedMessageMetadataReader } from '@masknet/typed-message-react'
import { EVMChainResolver } from '@masknet/web3-providers'
import type { RedPacketJSONPayload, RedPacketNftJSONPayload } from '@masknet/web3-providers/types'
import { ChainId } from '@masknet/web3-shared-evm'
import { Ok, type Result } from 'ts-results-es'
import { RedPacketMetaKey, RedPacketNftMetaKey } from '../constants.js'
import schemaNtf from '../schema-nft.json' with { type: 'json' }
import schema from '../schema.json' with { type: 'json' }

const reader = createTypedMessageMetadataReader<RedPacketJSONPayload>(RedPacketMetaKey, schema)
export function RedPacketMetadataReader(
    metadata: ReadonlyMap<string, unknown> | undefined,
): Result<RedPacketJSONPayload, void> {
    const result = reader(metadata)
    if (result.isOk()) {
        const payload = result.value
        // Hard code for legacy RedPacket
        if (!payload.token && payload.contract_version === 1 && payload.token_type === 0) {
            const chainId = payload.network === 'Mainnet' ? ChainId.Mainnet : undefined
            if (!chainId) return result

            return Ok({
                ...payload,
                token: EVMChainResolver.nativeCurrency(chainId),
            })
        }
        return result
    }
    return result
}
export const renderWithRedPacketMetadata = createRenderWithMetadata(RedPacketMetadataReader)

export const RedPacketNftMetadataReader = createTypedMessageMetadataReader<RedPacketNftJSONPayload>(
    RedPacketNftMetaKey,
    schemaNtf,
)
export const renderWithRedPacketNftMetadata = createRenderWithMetadata(RedPacketNftMetadataReader)
