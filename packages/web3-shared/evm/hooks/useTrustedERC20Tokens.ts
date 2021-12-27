import { useWallet } from './useWallet'
import { useERC20Tokens } from './useERC20Tokens'
import { formatEthereumAddress } from '../utils'

export function useTrustedERC20Tokens() {
    const wallet = useWallet()
    const tokens = useERC20Tokens()

    if (!wallet) return []
    return tokens.filter(
        (x) =>
            wallet.erc20_token_whitelist.has(formatEthereumAddress(x.address)) &&
            !wallet.erc20_token_blacklist.has(formatEthereumAddress(x.address)),
    )
}
