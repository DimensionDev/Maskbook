import { useWallet } from './useWallet'
import { useAsyncRetry } from 'react-use'
import { useWeb3Context, useWeb3State } from '../context'

export function useERC20TokensPaged(index: number, count: number) {
    const wallet = useWallet()
    const { getERC20TokensPaged } = useWeb3Context()
    const { erc20TokensCount } = useWeb3State()
    return useAsyncRetry(async () => {
        if (!wallet)
            return {
                tokens: [],
                count: 0,
            }
        const erc20Tokens = await getERC20TokensPaged(index, count)

        return {
            tokens: erc20Tokens.filter(
                (x) => wallet.erc20_token_whitelist.has(x.address) && !wallet.erc20_token_blacklist.has(x.address),
            ),
            count: erc20TokensCount,
        }
    }, [index, count])
}
