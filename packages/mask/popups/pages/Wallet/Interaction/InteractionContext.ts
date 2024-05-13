import { useWallet } from '@masknet/web3-hooks-base'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { useEffect, useState } from 'react'
import { createContainer } from 'unstated-next'

/**
 * This context is used to allow different Wallet to be used (rather that the "selected" wallet in the main UI)
 * when a interaction is going on (like signing a transaction).
 */
export const { Provider: InteractionWalletContext, useContainer: useInteractionWalletContext } = createContainer(
    function () {
        const wallet = useWallet()
        const [interactionWallet, setInteractionWallet] = useState<string | undefined>()

        function useInteractionWallet(currentInteractingWallet: string | undefined) {
            useEffect(() => {
                if (currentInteractingWallet === interactionWallet) return
                if (!isValidAddress(currentInteractingWallet)) return
                setInteractionWallet(currentInteractingWallet)
            }, [currentInteractingWallet, setInteractionWallet])
        }

        return {
            interactionWallet: interactionWallet || wallet?.address,
            useInteractionWallet,
        }
    },
)
InteractionWalletContext.displayName = 'InteractionWalletContext'
