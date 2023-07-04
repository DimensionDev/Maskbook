import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { createContainer } from 'unstated-next'
import { useChainContext, useRecentTransactions, useFungibleAssets, useWallets } from '@masknet/web3-hooks-base'
import { EMPTY_LIST, NetworkPluginID, type Wallet } from '@masknet/shared-base'
import { type FungibleAsset, isSameAddress, type RecentTransactionComputed } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType, Transaction } from '@masknet/web3-shared-evm'

function useWalletContext() {
    const location = useLocation()
    const wallets = useWallets()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { data: assets, isLoading, refetch } = useFungibleAssets(NetworkPluginID.PLUGIN_EVM, undefined, { chainId })
    const transactions = useRecentTransactions(NetworkPluginID.PLUGIN_EVM)
    const [currentToken, setCurrentToken] = useState<FungibleAsset<ChainId, SchemaType>>()
    const [transaction, setTransaction] = useState<RecentTransactionComputed<ChainId, Transaction>>()
    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>()

    useEffect(() => {
        const contractAccount = new URLSearchParams(location.search).get('contractAccount')
        if (!contractAccount || selectedWallet) return
        const target = wallets.find((x) => isSameAddress(x.address, contractAccount))
        setSelectedWallet(target)
    }, [location.search, wallets, selectedWallet])

    const currentChainAssets = useMemo(() => {
        return assets?.filter((asset) => asset.chainId === chainId) ?? EMPTY_LIST
    }, [assets, chainId])

    return {
        currentToken,
        setCurrentToken,
        assets: currentChainAssets,
        refreshAssets: refetch,
        transactions,
        assetsLoading: isLoading,
        transaction,
        setTransaction,
        /**
         * @deprecated
         * Avoid using this, pass wallet as a router parameter instead
         */
        selectedWallet,
        setSelectedWallet,
    }
}

export const WalletContext = createContainer(useWalletContext)
