import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { useChainId, useRecentTransactions, useFungibleAssets } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { FungibleAsset, RecentTransactionComputed, Wallet } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType, Transaction } from '@masknet/web3-shared-evm'

function useWalletContext() {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { value: assets, loading } = useFungibleAssets(NetworkPluginID.PLUGIN_EVM, undefined, { chainId })
    const transactions = useRecentTransactions(NetworkPluginID.PLUGIN_EVM)
    const [currentToken, setCurrentToken] = useState<FungibleAsset<ChainId, SchemaType>>()
    const [transaction, setTransaction] = useState<RecentTransactionComputed<ChainId, Transaction>>()
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
