import { createContainer } from 'unstated-next'
import { useTrustedERC20TokensFromDB } from '@dimensiondev/web3-shared'
import { useAssets } from './useAssets'

function useWalletContext() {
    const erc20Tokens = useTrustedERC20TokensFromDB()
    const {
        value: detailedTokens,
        error: detailedTokensError,
        loading: detailedTokensLoading,
        retry: detailedTokensRetry,
    } = useAssets(erc20Tokens)

    return {
        detailedTokens,
        detailedTokensError,
        detailedTokensLoading,
        detailedTokensRetry,
    }
}

export const WalletContext = createContainer(useWalletContext)
