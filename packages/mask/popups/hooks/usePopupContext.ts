/**
 * Warning: Don't change this context.
 * This will be removed
 */

import { createContainer } from '@masknet/shared-base-ui'
import { useState } from 'react'

function usePopupContext() {
    const [signed, setSigned] = useState(false)
    return {
        signed,
        setSigned,
    }
}

export const PopupContext = createContainer(usePopupContext)
PopupContext.Provider.displayName = 'PopupContext'
