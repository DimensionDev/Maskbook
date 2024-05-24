import { useState } from 'react'
import { createContainer } from '@masknet/shared-base-ui'

function useDeriveState() {
    return useState(false)
}

export const DeriveStateContext = createContainer(useDeriveState)
