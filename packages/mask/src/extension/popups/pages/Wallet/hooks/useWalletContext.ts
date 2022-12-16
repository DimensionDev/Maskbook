import { useMemo, useState } from 'react'
import { createContainer } from 'unstated-next'
import {
    useChainContext,
    useRecentTransactions,
    useFungibleAssets,
    useWeb3State,
    useFungibleTokenBalance,
} from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { FungibleAsset, RecentTransactionComputed, Wallet } from '@masknet/web3-shared-base'
import { ChainId, SchemaType, Transaction } from '@masknet/web3-shared-evm'
import { compact } from 'lodash-es'
import type { Web3Helper } from '@masknet/web3-helpers'

function useWalletContext() {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { value: assets, loading } = useFungibleAssets(NetworkPluginID.PLUGIN_EVM, undefined, { chainId })
    const transactions = useRecentTransactions(NetworkPluginID.PLUGIN_EVM)
    const [currentToken, setCurrentToken] = useState<FungibleAsset<ChainId, SchemaType>>()
    const [transaction, setTransaction] = useState<RecentTransactionComputed<ChainId, Transaction>>()
    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>()
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const maskAddress = Others?.getMaskTokenAddress(chainId)
    const { value: maskBalance } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, maskAddress, { chainId })

    const allAssets = useMemo(() => {
        if (!assets) return []

        const target = assets.filter((asset) => asset.chainId === chainId)
        if (target.length > 1) return target

        const maskAsset: Web3Helper.FungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM> | undefined =
            maskAddress && Others?.createFungibleToken
                ? {
                      ...Others.createFungibleToken(chainId, SchemaType.ERC20, maskAddress, 'Mask', 'Mask', 18),
                      balance: maskBalance ?? '0',
                  }
                : undefined
        return compact([...target, maskAsset])
    }, [assets, chainId, maskAddress, maskBalance])

    return {
        currentToken,
        setCurrentToken,
        assets: allAssets,
        transactions,
        assetsLoading: loading,
        transaction,
        setTransaction,
        selectedWallet,
        setSelectedWallet,
    }
}

export const WalletContext = createContainer(useWalletContext)
