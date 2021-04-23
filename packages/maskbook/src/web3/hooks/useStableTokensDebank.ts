import { formatChecksumAddress } from '../../plugins/Wallet/formatter'
import { createERC20Token } from '../helpers'
import { ChainId } from '../types'
import { useChainId } from './useChainId'
import StableCoins from './stables_coins.json'

export function useStableTokensDebank() {
    const chainId = useChainId()
    if (chainId !== ChainId.Mainnet) return []

    return StableCoins.map((x: { id: string; decimals: number; name: string; symbol: string }) =>
        createERC20Token(chainId, formatChecksumAddress(x.id), x.decimals, x.name, x.symbol),
    )
}
