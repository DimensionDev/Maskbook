import { useState } from 'react'
import { createContainer } from 'unstated-next'
// import { useAssets, Asset } from '@masknet/web3-shared-evm'
// import { useRecentTransactions } from '../../../../../plugins/Wallet/hooks/useRecentTransactions'
import { useChainId, useTrustedFungibleTokens, useTransactions } from '@masknet/plugin-infra/web3'
import { FungibleAsset, NetworkPluginID, Transaction } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { SchemaType } from '@masknet/web3-shared-evm'

function useWalletContext() {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const erc20Tokens = useTrustedFungibleTokens(NetworkPluginID.PLUGIN_EVM)
    const transactions = useTransactions(NetworkPluginID.PLUGIN_EVM)
    const [currentToken, setCurrentToken] = useState<FungibleAsset<ChainId, SchemaType>>()
    const [transaction, setTransaction] = useState<Transaction<ChainId, SchemaType> | null>()

    return {
        currentToken,
        setCurrentToken,
        // assets: assets.filter((asset) => asset.token.chainId === chainId),
        assets: [],
        transactions,
        assetsLoading: false,
        transaction,
        setTransaction,
    }
}

export const WalletContext = createContainer(useWalletContext)
