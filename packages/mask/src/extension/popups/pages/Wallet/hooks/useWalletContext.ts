import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { useChainId, useRecentTransactions, useFungibleAssets } from '@masknet/plugin-infra/web3'
import { FungibleAsset, NetworkPluginID, RecentTransaction, Wallet } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType, Transaction } from '@masknet/web3-shared-evm'

function useWalletContext() {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { value: assets, loading } = useFungibleAssets(NetworkPluginID.PLUGIN_EVM)
    const transactions = useRecentTransactions(NetworkPluginID.PLUGIN_EVM)
    const [currentToken, setCurrentToken] = useState<FungibleAsset<ChainId, SchemaType>>()
    const [transaction, setTransaction] = useState<RecentTransaction<ChainId, Transaction>>()
    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>()
    return {
        currentToken,
        setCurrentToken,
        assets: assets?.filter((asset) => asset.chainId === chainId) ?? [],
        transactions,
        assetsLoading: loading,
        transaction,
        setTransaction,
        selectedWallet,
        setSelectedWallet,
    }
}

export const WalletContext = createContainer(useWalletContext)
