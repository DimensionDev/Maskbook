import { useWeb3StateContext } from '../context'
import type { ChainId, EthereumTokenType } from '../types'
import { useWallet } from './useWallet'

export interface ERC20Token {
    type: EthereumTokenType.ERC20
    address: string
    chainId: ChainId
}

export interface ERC20TokenDetailed extends ERC20Token {
    name?: string
    symbol?: string
    decimals: number
}

export function useERC20TokensFromDB() {
    return useWeb3StateContext().erc20Tokens
}

export function useTrustedERC20TokensFromDB() {
    const wallet = useWallet()
    const tokens = useERC20TokensFromDB()
    if (!wallet) return []
    return tokens.filter(
        (x) => wallet.erc20_token_whitelist.has(x.address) && !wallet.erc20_token_blacklist.has(x.address),
    )
}
