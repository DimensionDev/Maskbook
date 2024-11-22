import { createRenderWithMetadata, createTypedMessageMetadataReader } from '@masknet/typed-message-react'
import { EVMChainResolver } from '@masknet/web3-providers'
import type { RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { ChainId } from '@masknet/web3-shared-evm'
import { Ok, type Result } from 'ts-results-es'
import { RedPacketMetaKey } from '../constants.js'
import schema from '../schema.json'

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
