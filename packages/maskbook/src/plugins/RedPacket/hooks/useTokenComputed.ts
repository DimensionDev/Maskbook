import { CONSTANTS } from '../../../web3/constants'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useToken } from '../../../web3/hooks/useToken'
import { EthereumTokenType } from '../../../web3/types'
import type { RedPacketJSONPayload } from '../types'

/**
 * Fetch the red packet token info from the chain
 * @param payload
 */
export function useTokenComputed(payload: RedPacketJSONPayload) {
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')
    const asyncResult = useToken({
        type: payload.token_type,
        address: payload.token_type === EthereumTokenType.Ether ? ETH_ADDRESS : payload.token?.address ?? '',
    })

    return {
        ...asyncResult,
        computed: {},
    }
}
