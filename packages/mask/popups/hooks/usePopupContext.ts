/**
 * Warning: Don't change this context.
 * This will be removed
 */

import { createContainer } from '@masknet/shared-base-ui'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

function usePopupContext() {
    const [signed, setSigned] = useState(false)
    return {
        signed,
        setSigned,
    }
}

export const PopupContext = createContainer(usePopupContext)
PopupContext.Provider.displayName = 'PopupContext'
