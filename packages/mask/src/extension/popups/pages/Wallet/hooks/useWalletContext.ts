import { type Wallet } from '@masknet/shared-base'
import { useWallets } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { createContainer } from 'unstated-next'

function useWalletContext() {
    const location = useLocation()
    const wallets = useWallets()
    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>()

    useEffect(() => {
        const contractAccount = new URLSearchParams(location.search).get('contractAccount')
        if (!contractAccount || selectedWallet) return
        const target = wallets.find((x) => isSameAddress(x.address, contractAccount))
        setSelectedWallet(target)
    }, [location.search, wallets, selectedWallet])

    return {
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
    }
}

export const WalletContext = createContainer(useWalletContext)
