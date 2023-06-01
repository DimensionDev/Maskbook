/**
 * Warning: Don't change this context.
 * This will be removed
 */

import { createContainer } from 'unstated-next'
import { useState } from 'react'
import { useAsync } from 'react-use'
import { SmartPayBundler } from '@masknet/web3-providers'

function usePopupContext() {
    const [signed, setSigned] = useState(false)
    const { value: smartPayChainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

    return {
        smartPayChainId,
        signed,
        setSigned,
    }
}

export const PopupContext = createContainer(usePopupContext)
