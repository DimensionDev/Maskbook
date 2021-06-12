import { useWallet } from './useWallet'
import { useWeb3State } from '../context'

export function useERC20Tokens() {
    const erc20Tokens = useWeb3State().erc20Tokens
    const wallet = useWallet()

    if (!wallet) return []
    return erc20Tokens
}
