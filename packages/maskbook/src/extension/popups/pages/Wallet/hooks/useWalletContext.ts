import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { useAssets, useTrustedERC20Tokens, Asset } from '@masknet/web3-shared'
import { useRecentTransactions } from '../../../../../plugins/Wallet/hooks/useRecentTransactions'

function useWalletContext() {
    const erc20Tokens = useTrustedERC20Tokens()
    const { value: assets, error, loading } = useAssets(erc20Tokens)
    const { value: transactions } = useRecentTransactions()
    const [currentToken, setCurrentToken] = useState<Asset>()

    return {
        currentToken,
        setCurrentToken,
        assets,
        transactions,
    }
}

export const WalletContext = createContainer(useWalletContext)
