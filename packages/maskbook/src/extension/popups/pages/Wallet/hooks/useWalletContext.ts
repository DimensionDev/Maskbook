import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { useAssets, useTrustedERC20Tokens, Asset } from '@masknet/web3-shared'

function useWalletContext() {
    const erc20Tokens = useTrustedERC20Tokens()
    const { value: assets, error, loading } = useAssets(erc20Tokens)
    const [currentToken, setCurrentToken] = useState<Asset>()

    return {
        currentToken,
        setCurrentToken,
        assets,
    }
}

export const WalletContext = createContainer(useWalletContext)
