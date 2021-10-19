import { useChainId } from './useChainId'
import STABLE_COINS from '../assets/stable-coins.json'
import { ChainId } from '../types'
import { createERC20Token, formatEthereumAddress } from '../utils'

export function useStableTokensDebank() {
    const chainId = useChainId()
    if (chainId !== ChainId.Mainnet) return []
    return STABLE_COINS.map((x: { id: string; decimals: number; name: string; symbol: string }) =>
        createERC20Token(chainId, formatEthereumAddress(x.id), x.decimals, x.name, x.symbol),
    )
}
