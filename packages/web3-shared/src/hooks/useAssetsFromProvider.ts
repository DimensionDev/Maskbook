import { useWeb3Context, useWeb3State } from '../context'
import { useAsyncRetry } from 'react-use'
import { useAccount } from './useAccount'

export function useAssetsFromProvider() {
    const { getAssetList } = useWeb3Context()
    const { portfolioProvider } = useWeb3State()
    const account = useAccount()

    return useAsyncRetry(async () => {
        if (!account) return []

        return getAssetList(account.toLowerCase(), portfolioProvider)
    }, [account, portfolioProvider])
}
