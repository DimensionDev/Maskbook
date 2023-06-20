import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType, RedPacketJSONPayload } from '@masknet/web3-shared-evm'
import { pick, omit } from 'lodash-es'

export function reduceUselessPayloadInfo(payload: RedPacketJSONPayload): RedPacketJSONPayload {
    const token = pick(payload.token, ['decimals', 'symbol', 'address', 'chainId']) as FungibleToken<
        ChainId,
        SchemaType.Native | SchemaType.ERC20
    >
    return { ...omit(payload, ['block_number']), token }
}
