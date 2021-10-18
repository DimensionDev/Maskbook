import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { useAssets, useTrustedERC20Tokens, Asset, useChainDetailed } from '@masknet/web3-shared'
import { useRecentTransactions } from '../../../../../plugins/Wallet/hooks/useRecentTransactions'
import type { RecentTransaction } from '../../../../../plugins/Wallet/services'

function useWalletContext() {
    const chainDetailed = useChainDetailed()
    const erc20Tokens = useTrustedERC20Tokens()
    const { value: assets, loading } = useAssets(erc20Tokens)
    const { value: transactions } = useRecentTransactions()
    const [currentToken, setCurrentToken] = useState<Asset>()
    const [transaction, setTransaction] = useState<RecentTransaction | null>()

    return {
        currentToken,
        setCurrentToken,
        assets: assets.filter((asset) => asset.token.chainId === chainDetailed?.chainId),
        transactions,
        assetsLoading: loading,
        transaction,
        setTransaction,
    }
}

export const WalletContext = createContainer(useWalletContext)
