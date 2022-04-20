import { useState } from 'react'
import type { ChainId } from '@masknet/web3-shared-evm'

import { supportedChainIds } from '../constants'

export function useRequiredChainId(currentChainId: ChainId) {
    const [requiredChainId, setRequiredChainId] = useState(
        supportedChainIds.includes(currentChainId) ? currentChainId : supportedChainIds[0],
    )

    return requiredChainId
}
