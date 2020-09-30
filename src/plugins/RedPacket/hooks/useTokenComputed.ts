import BigNumber from 'bignumber.js'
import { CONSTANTS } from '../../../web3/constants'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useToken } from '../../../web3/hooks/useToken'
import { EthereumTokenType } from '../../../web3/types'
import { formatBalance } from '../../Wallet/formatter'
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

    const { value: token } = asyncResult
    if (!token)
        return {
            ...asyncResult,
            computed: {
                amount: '',
                symbol: '',
            },
        }

    const isEther = payload.token_type === EthereumTokenType.Ether
    return {
        ...asyncResult,
        computed: {
            amount: isEther
                ? formatBalance(new BigNumber(payload.total), 18, 18)
                : token
                ? formatBalance(new BigNumber(payload.total), token.decimals, token.decimals)
                : '-',
            symbol: isEther ? 'ETH' : token.symbol,
        },
    }
}
