import { useWeb3StateContext } from '../context'
import { useWallet } from './useWallet'

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
