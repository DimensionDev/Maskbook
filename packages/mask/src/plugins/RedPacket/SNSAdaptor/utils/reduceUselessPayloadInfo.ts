import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { RedPacketJSONPayload } from '../../types.js'
import { pick, omit } from 'lodash-unified'

export function reduceUselessPayloadInfo(payload: RedPacketJSONPayload): RedPacketJSONPayload {
    const token = pick(payload.token, ['decimals', 'symbol', 'address']) as FungibleToken<
        ChainId,
        SchemaType.Native | SchemaType.ERC20
    >
    return { ...omit(payload, ['claimers', 'block_number']), token }
}
