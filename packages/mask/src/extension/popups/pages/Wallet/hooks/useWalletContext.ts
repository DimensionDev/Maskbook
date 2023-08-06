import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { createContainer } from 'unstated-next'
import { useChainContext, useFungibleAssets, useWallets } from '@masknet/web3-hooks-base'
import { EMPTY_LIST, NetworkPluginID, type Wallet } from '@masknet/shared-base'
import { type FungibleAsset, isSameAddress } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

function useWalletContext() {
    const location = useLocation()
    const wallets = useWallets()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const {
        data: assets = EMPTY_LIST,
        isLoading,
        refetch,
    } = useFungibleAssets(NetworkPluginID.PLUGIN_EVM, undefined, { chainId })
    const [currentToken, setCurrentToken] = useState<FungibleAsset<ChainId, SchemaType>>()
    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>()

    const [assetsIsExpand, setAssetsIsExpand] = useState(false)

    useEffect(() => {
        const contractAccount = new URLSearchParams(location.search).get('contractAccount')
        if (!contractAccount || selectedWallet) return
        const target = wallets.find((x) => isSameAddress(x.address, contractAccount))
        setSelectedWallet(target)
    }, [location.search, wallets, selectedWallet])

    return {
        currentToken,
        setCurrentToken,
        assets,
        refreshAssets: refetch,
        assetsLoading: isLoading,
        /**
         * @deprecated
         * Avoid using this, pass wallet as a router parameter instead
         */
        selectedWallet,
        /**
         * @deprecated
         * pass wallet as a router parameter instead
         */
        setSelectedWallet,
        assetsIsExpand,
        setAssetsIsExpand,
    }
}

export const WalletContext = createContainer(useWalletContext)
