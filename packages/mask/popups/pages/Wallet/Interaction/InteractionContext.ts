import { useWallet } from '@masknet/web3-hooks-base'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { useState } from 'react'
import { createContainer, useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'

/**
 * This context is used to allow different Wallet to be used (rather that the "selected" wallet in the main UI)
 * when a interaction is going on (like signing a transaction).
 */
export const { Provider: InteractionWalletContext, useContainer: useInteractionWalletContext } = createContainer(
    function () {
        const wallet = useWallet()
        const [interactionWallet, setInteractionWallet] = useState<string | undefined>()

        function useInteractionWallet(currentInteractingWallet: string | undefined) {
            useRenderPhraseCallbackOnDepsChange(() => {
                if (!isValidAddress(currentInteractingWallet)) return
                Promise.resolve().then(() => setInteractionWallet(currentInteractingWallet))
            }, [currentInteractingWallet])
        }

        return {
            interactionWallet: interactionWallet || wallet?.address,
            useInteractionWallet,
        }
    },
)
InteractionWalletContext.displayName = 'InteractionWalletContext'
