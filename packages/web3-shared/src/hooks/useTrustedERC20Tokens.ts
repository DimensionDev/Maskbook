import { useChainId } from './useChainId'
import { useWallet } from './useWallet'
import { useERC20Tokens } from './useERC20Tokens'

export function useTrustedERC20Tokens() {
    const chainId = useChainId()
    const wallet = useWallet()
    const tokens = useERC20Tokens()

    if (!wallet) return []
    return tokens.filter(
        (x) =>
            x.chainId === chainId &&
            wallet.erc20_token_whitelist.has(x.address) &&
            !wallet.erc20_token_blacklist.has(x.address),
    )
}
