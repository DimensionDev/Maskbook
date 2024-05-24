import { useState } from 'react'
import { createContainer } from '@masknet/shared-base-ui'
import type { PersonaInformation, Wallet } from '@masknet/shared-base'

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
