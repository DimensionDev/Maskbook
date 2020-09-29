import type { Token } from '../types'
import { useTokensBalance } from './useTokensBalance'
import { useConstant } from './useConstant'
import { CONSTANTS } from '../constants'
import { useChainId } from './useChainId'

export function useTokensDetailed(account: string, tokens: Token[]) {
    const chainId = useChainId()
    const ETH_ADDRSS = useConstant(CONSTANTS, 'ETH_ADDRESS')
    const { value: listOfBalance } = useTokensBalance(
        account,
        tokens.map((x) => x.address),
    )
    if ((listOfBalance ?? []).length !== tokens.length) return []
    return listOfBalance
        ?.map((balance, idx) => ({
            token: tokens[idx],
            balance,
        }))
        .filter((x) => x.token.chainId === chainId)
        .sort((a, z) => {
            if (a.token.address === ETH_ADDRSS) return 1
            if (z.token.address === ETH_ADDRSS) return 1
            if (a.balance.length < z.balance.length) return 1
            if (a.balance.length > z.balance.length) return -1
            if (a.balance < z.balance) return 1
            if (a.balance > z.balance) return -1
            return 0
        })
}
