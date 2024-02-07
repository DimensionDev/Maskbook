import { useWallet } from '@masknet/web3-hooks-base'
import { useState } from 'react'
import { createContainer } from 'unstated-next'

/**
 * This context is used to allow different Wallet to be used (rather that the "selected" wallet in the main UI)
 * when a interaction is going on (like signing a transaction).
 */
export const { Provider: InteractionWalletContext, useContainer: useInteractionWalletContext } = createContainer(
    function () {
        const wallet = useWallet()
        const [interactionWallet, setInteractionWallet] = useState<string | undefined>()
        return { interactionWallet: interactionWallet || wallet?.address, setInteractionWallet }
    },
)
InteractionWalletContext.displayName = 'InteractionContext'
