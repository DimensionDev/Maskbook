/**
 * Warning: Don't change this context.
 * This will be removed
 */

import { createContainer } from '@masknet/shared-base-ui'
import { useState } from 'react'
import { SmartPayBundler } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'

function usePopupContext() {
    const [signed, setSigned] = useState(false)
    const { data: smartPayChainId } = useQuery({
        queryKey: ['@@SmartPayBundler.getSupportedChainId'],
        queryFn: () => SmartPayBundler.getSupportedChainId(),
    })

    return {
        smartPayChainId,
        signed,
        setSigned,
    }
}

export const PopupContext = createContainer(usePopupContext)
PopupContext.Provider.displayName = 'PopupContext'
