import { formatEthereumAddress } from '@dimensiondev/maskbook-shared'
import { createERC20Token } from '../helpers'
import { ChainId } from '../types'
import { useChainId } from './useChainId'
import STABLE_COINS from '../assets/stables_coins.json'

export function useStableTokensDebank() {
    const chainId = useChainId()
    if (chainId !== ChainId.Mainnet) return []
    return STABLE_COINS.map((x: { id: string; decimals: number; name: string; symbol: string }) =>
        createERC20Token(chainId, formatEthereumAddress(x.id), x.decimals, x.name, x.symbol),
    )
}
