import { useState } from 'react'
import { createContainer } from '@masknet/shared-base-ui'

function useDeriveState() {
    const [derived, setDerived] = useState(false)
    return [derived, setDerived] as const
}

export const DeriveStateContext = createContainer(useDeriveState)
