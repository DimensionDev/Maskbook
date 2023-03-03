import type { PersonaInformation, Wallet } from '@masknet/web3-shared-base'
import { useState } from 'react'
import { createContainer } from 'unstated-next'

function useSmartPayContext() {
    const [signer, setSigner] = useState<
        | {
              signWallet?: Wallet
              signPersona?: PersonaInformation
          }
        | undefined
    >()

    return {
        signer,
        setSigner,
    }
}

export const SmartPayContext = createContainer(useSmartPayContext)
